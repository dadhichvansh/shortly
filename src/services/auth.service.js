import { eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { usersTable } from "../drizzle/schema.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

export const doesUserExist = async (email) => {
  const [username] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  return username ?? null;
};

export const createUser = async ({ name, email, hashedPassword }) => {
  return await db
    .insert(usersTable)
    .values({ username: name, email, password: hashedPassword })
    .$returningId();
};

export const hashPassword = async (password) => {
  return await argon2.hash(password);
};

export const comparePassword = async (hashedPassword, password) => {
  return await argon2.verify(hashedPassword, password);
};

export const generateToken = ({ id, username, email }) => {
  return jwt.sign({ id, username, email }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
};

export const verifyJwt = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
