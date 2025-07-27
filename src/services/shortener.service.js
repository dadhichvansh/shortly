import { eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { shortLinksTable } from "../drizzle/schema.js";

export const fetchShortenedUrls = async () => {
  return await db.select().from(shortLinksTable);
};

export const fetchShortenedUrlByShortCode = async (shortCode) => {
  const [result] = await db
    .select()
    .from(shortLinksTable)
    .where(eq(shortLinksTable.shortCode, shortCode));
  return result;
};

export const saveShortenedUrl = async ({ url, finalShortCode }) => {
  await db.insert(shortLinksTable).values({ url, shortCode: finalShortCode });
};
