import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  /** Null for Google OAuth-only accounts */
  passwordHash: text('password_hash'),
  emailVerified: boolean('email_verified').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const userConnections = pgTable('user_connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  postgresUrlEncrypted: text('postgres_url_encrypted'),
  openaiKeyEncrypted: text('openai_key_encrypted'),
  chatModel: text('chat_model'),
  visionModel: text('vision_model'),
  embeddingModel: text('embedding_model'),
  aiProvider: text('ai_provider'),
  /** OpenAI-compatible endpoint for the `ollama` and `custom` providers. */
  aiBaseUrl: text('ai_base_url'),
  connectionVerified: boolean('connection_verified').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const desktopLoginSessions = pgTable('desktop_login_sessions', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  token: text('token').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  consumed: boolean('consumed').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserConnection = typeof userConnections.$inferSelect;
