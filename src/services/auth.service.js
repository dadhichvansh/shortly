import { and, eq, gte, lt, sql } from 'drizzle-orm';
import { db } from '../db/db.js';
import {
  sessionsTable,
  usersTable,
  verifyEmailTokensTable,
} from '../drizzle/schema.js';
import { sendEmail } from '../lib/send-email.js';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from '../constants.js';
import path from 'path';
import fs from 'fs/promises';
import mjml2html from 'mjml';
import ejs from 'ejs';
import { MILLISECONDS_PER_SECOND } from '../constants.js';

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

export const createSession = async (userId, { ip, userAgent }) => {
  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_EXPIRY * MILLISECONDS_PER_SECOND
  );

  const [session] = await db
    .insert(sessionsTable)
    .values({ userId, ip, userAgent, expiresAt })
    .$returningId();

  return session;
};

export const createAccessToken = ({
  id,
  username,
  email,
  isEmailValid,
  sessionId,
}) => {
  return jwt.sign(
    { id, username, email, isEmailValid, sessionId },
    process.env.JWT_SECRET,
    {
      expiresIn: ACCESS_TOKEN_EXPIRY / MILLISECONDS_PER_SECOND, // 15 mins expiry
    }
  );
};

export const createRefreshToken = (sessionId) => {
  return jwt.sign({ sessionId }, process.env.JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY / MILLISECONDS_PER_SECOND, // 1 week expiry
  });
};

export const verifyJwt = (token, options = {}) => {
  return jwt.verify(token, process.env.JWT_SECRET, options);
};

export const findSessionById = async (sessionId) => {
  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.id, sessionId));

  return session;
};

export const findUserById = async (userId) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  return user;
};

export const refreshTokens = async (refreshToken) => {
  try {
    const decodedToken = verifyJwt(refreshToken);
    const currentSession = await findSessionById(decodedToken.sessionId);

    if (!currentSession || !currentSession.isValid) {
      throw new Error('Invalid session');
    }

    const user = await findUserById(currentSession.userId);

    if (!user) {
      throw new Error('Invalid user');
    }

    const userInfo = {
      id: user.id,
      username: user.username,
      email: user.email,
      isEmailValid: user.isEmailValid,
      sessionId: currentSession.id,
    };

    const newAccessToken = createAccessToken(userInfo);
    const newRefreshToken = createRefreshToken(currentSession.id);

    return { newAccessToken, newRefreshToken, user: userInfo };
  } catch (error) {
    throw error;
  }
};

export const clearUserSession = (sessionId) => {
  return db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
};

export const createUserSession = async ({ req, res, user, name, email }) => {
  const session = await createSession(user.id, {
    ip: req.clientIp,
    userAgent: req.headers['user-agent'],
  });
  const accessToken = createAccessToken({
    id: user.id,
    username: user.username || name,
    email: user.email || email,
    isEmailValid: false,
    sessionId: session.id,
  });
  const refreshToken = createRefreshToken(session.id);
  const baseConfig = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res.cookie('access_token', accessToken, {
    ...baseConfig,
    maxAge: ACCESS_TOKEN_EXPIRY,
  });
  res.cookie('refresh_token', refreshToken, {
    ...baseConfig,
    maxAge: REFRESH_TOKEN_EXPIRY,
  });
};

export const generateRandomToken = (digit = 8) => {
  const min = 10 ** (digit - 1);
  const max = 10 ** digit;

  return crypto.randomInt(min, max).toString();
};

export const insertVerifiedEmailToken = async ({ userId, token }) => {
  return db.transaction(async (tx) => {
    try {
      await tx
        .delete(verifyEmailTokensTable)
        .where(lt(verifyEmailTokensTable.expiresAt, sql`CURRENT_TIMESTAMP`));

      // delete any existing tokens for this specific user
      await tx
        .delete(verifyEmailTokensTable)
        .where(eq(verifyEmailTokensTable.userId, userId));

      // insert the new token
      await tx.insert(verifyEmailTokensTable).values({ userId, token });
    } catch (error) {
      console.error('Failed to insert verification token:', error);
      throw new Error('Unable to create verification token');
    }
  });
};

export const createEmailVerificationLink = ({ email, token }) => {
  const url = new URL(`${process.env.FRONTEND_URL}/verify-email-token`);

  url.searchParams.append('token', token);
  url.searchParams.append('email', email);

  return url.toString();
};

export const findEmailVerificationToken = async ({ token, email }) => {
  return await db
    .select({
      userId: usersTable.id,
      email: usersTable.email,
      token: verifyEmailTokensTable.token,
      expiresAt: verifyEmailTokensTable.expiresAt,
    })
    .from(verifyEmailTokensTable)
    .where(
      and(
        eq(verifyEmailTokensTable.token, token),
        eq(usersTable.email, email),
        gte(verifyEmailTokensTable.expiresAt, sql`CURRENT_TIMESTAMP`)
      )
    )
    .innerJoin(usersTable, eq(verifyEmailTokensTable.userId, usersTable.id));
};

export const verifyUserEmailAndUpdate = async (email) => {
  return db
    .update(usersTable)
    .set({ isEmailValid: true })
    .where(eq(usersTable.email, email));
};

export const clearEmailVerificationTokens = async (email) => {
  const [user] = await db
    .update(usersTable)
    .set({ isEmailValid: true })
    .where(eq(usersTable.email, email));

  return await db
    .delete(verifyEmailTokensTable)
    .where(eq(verifyEmailTokensTable.userId, user.id));
};

export const sendNewEmailVerificationLink = async ({ userId, email }) => {
  const randomToken = generateRandomToken();
  await insertVerifiedEmailToken({ userId, token: randomToken });

  const emailVerificationLink = createEmailVerificationLink({
    email,
    token: randomToken,
  });

  const mjmlTemplate = await fs.readFile(
    path.join(import.meta.dirname, '..', 'emails', 'verify-email.mjml'),
    'utf-8'
  );

  const filledTemplate = ejs.render(mjmlTemplate, {
    code: randomToken,
    link: emailVerificationLink,
  });

  const htmlOutput = mjml2html(filledTemplate).html;

  sendEmail({
    to: email,
    subject: 'Verify your email',
    html: htmlOutput,
  }).catch(console.error);
};

export const updateUserByName = async ({ id, name }) => {
  return await db
    .update(usersTable)
    .set({ username: name })
    .where(eq(usersTable.id, id));
};
