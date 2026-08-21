import { pgTable, text, timestamp, boolean, serial, integer, uniqueIndex } from "drizzle-orm/pg-core"

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// --- Codeit app tables -----------------------------------------------------
// No foreign keys per the Neon skill; scoping is done via userId columns.

// Communities (like subreddits). Named "c/<slug>".
export const community = pgTable("community", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  // The user who created the community.
  userId: text("userId").notNull(),
  creatorName: text("creatorName").notNull().default(""),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// Posts: AI-generated code shared to a community.
export const post = pgTable("post", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  language: text("language").notNull().default("html"),
  code: text("code").notNull(),
  // The AI tool used to generate the code (e.g. v0, ChatGPT, Claude).
  aiTool: text("aiTool").notNull().default(""),
  // Uploaded ~7s demo video URL (Vercel Blob).
  demoUrl: text("demoUrl"),
  communityId: integer("communityId").notNull(),
  communitySlug: text("communitySlug").notNull(),
  userId: text("userId").notNull(),
  authorName: text("authorName").notNull().default(""),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// Comments (flat, with optional parent for one level of threading).
export const comment = pgTable("comment", {
  id: serial("id").primaryKey(),
  postId: integer("postId").notNull(),
  parentId: integer("parentId"),
  body: text("body").notNull(),
  userId: text("userId").notNull(),
  authorName: text("authorName").notNull().default(""),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// Votes on posts. value is 1 (up) or -1 (down). Unique per user+post.
export const vote = pgTable(
  "vote",
  {
    id: serial("id").primaryKey(),
    postId: integer("postId").notNull(),
    userId: text("userId").notNull(),
    value: integer("value").notNull(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (t) => ({
    userPostUnique: uniqueIndex("vote_user_post_unique").on(t.userId, t.postId),
  }),
)

// Membership in a community.
export const membership = pgTable(
  "membership",
  {
    id: serial("id").primaryKey(),
    communityId: integer("communityId").notNull(),
    userId: text("userId").notNull(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (t) => ({
    userCommunityUnique: uniqueIndex("membership_user_community_unique").on(t.userId, t.communityId),
  }),
)
