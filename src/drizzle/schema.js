import { relations, sql } from 'drizzle-orm';
import {
  int,
  mysqlTable,
  varchar,
  timestamp,
  boolean,
  text,
} from 'drizzle-orm/mysql-core';

// Define tables and their relations
export const shortLinksTable = mysqlTable('short_links', {
  id: int().autoincrement().primaryKey(),
  url: varchar({ length: 255 }).notNull(),
  shortCode: varchar('short_code', { length: 20 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
  userId: int('user_id')
    .notNull()
    .references(() => usersTable.id),
});

export const sessionsTable = mysqlTable('sessions', {
  id: int().autoincrement().primaryKey(),
  userId: int('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  isValid: boolean('is_valid').default(true).notNull(),
  userAgent: text('user_agent'),
  ip: varchar({ length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const verifyEmailTokensTable = mysqlTable('verify_email_tokens', {
  id: int().autoincrement().primaryKey(),
  userId: int('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  token: varchar({ length: 8 }).notNull(),
  expiresAt: timestamp('expires_at')
    .default(sql`(CURRENT_TIMESTAMP + INTERVAL 15 MINUTE)`)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const usersTable = mysqlTable('users', {
  id: int().autoincrement().primaryKey(),
  username: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  isEmailValid: boolean('is_email_valid').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// A user can have many short links
export const usersRelation = relations(usersTable, ({ many }) => ({
  shortLink: many(shortLinksTable),
  session: many(sessionsTable),
}));

// A short link belongs to a user
export const shortLinksRelation = relations(shortLinksTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [shortLinksTable.userId], // foreign key
    references: [usersTable.id],
  }),
}));

export const sessionsRelation = relations(sessionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [sessionsTable.userId], // foreign key
    references: [usersTable.id],
  }),
}));
