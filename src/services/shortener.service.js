import { eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { shortLinksTable } from "../drizzle/schema.js";

export const fetchShortenedUrls = async (userId) => {
  return await db
    .select()
    .from(shortLinksTable)
    .where(eq(shortLinksTable.userId, userId));
};

export const fetchShortenedUrlByShortCode = async (shortCode) => {
  const [result] = await db
    .select()
    .from(shortLinksTable)
    .where(eq(shortLinksTable.shortCode, shortCode));
  return result;
};

export const saveShortenedUrl = async ({ url, shortCode, userId }) => {
  await db.insert(shortLinksTable).values({ url, shortCode, userId });
};

export const findShortLinkById = async (id) => {
  const [result] = await db
    .select()
    .from(shortLinksTable)
    .where(eq(shortLinksTable.id, id));
  return result;
};

export const updateShortCode = async ({ id, url, shortCode }) => {
  return await db
    .update(shortLinksTable)
    .set({ url, shortCode })
    .where(eq(shortLinksTable.id, id));
};

export const deleteShortenedUrlById = async (id) => {
  return await db.delete(shortLinksTable).where(eq(shortLinksTable.id, id));
};
