import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, integer, boolean, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  genre: text("genre"),
  lastOpened: timestamp("last_opened"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chapters = pgTable("chapters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  wordCount: integer("word_count").notNull().default(0),
  order: integer("order").notNull(),
  lastSaved: timestamp("last_saved").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  wordCount: integer("word_count").notNull().default(0),
  lastSaved: timestamp("last_saved").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const characters = pgTable("characters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  role: text("role"),
  age: text("age"),
  appearance: text("appearance"),
  traits: text("traits"),
  relationships: jsonb("relationships").default("[]"),
  lastMentioned: text("last_mentioned"),
  chapterId: varchar("chapter_id").references(() => chapters.id),
});

export const locations = pgTable("locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type"),
  description: text("description"),
  keyFeatures: text("key_features"),
  firstMentioned: text("first_mentioned"),
  chapterId: varchar("chapter_id").references(() => chapters.id),
});

export const timelineEvents = pgTable("timeline_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  chapter: text("chapter"),
  chapterId: varchar("chapter_id").references(() => chapters.id),
  description: text("description"),
  order: integer("order").notNull(),
});

export const aiSuggestions = pgTable("ai_suggestions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  chapterId: varchar("chapter_id").references(() => chapters.id),
  type: text("type").notNull(), // 'synonym', 'grammar', 'style', 'plot'
  originalText: text("original_text").notNull(),
  suggestion: text("suggestion").notNull(),
  position: integer("position").notNull(),
  applied: boolean("applied").default(false),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  userId: true,
  lastOpened: true,
  createdAt: true,
});

export const insertChapterSchema = createInsertSchema(chapters).omit({
  id: true,
  lastSaved: true,
  createdAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  lastSaved: true,
  createdAt: true,
});

export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true,
});

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
});

export const insertTimelineEventSchema = createInsertSchema(timelineEvents).omit({
  id: true,
});

export const insertAiSuggestionSchema = createInsertSchema(aiSuggestions).omit({
  id: true,
});

export type Project = typeof projects.$inferSelect;
export type Chapter = typeof chapters.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type Character = typeof characters.$inferSelect;
export type Location = typeof locations.$inferSelect;
export type TimelineEvent = typeof timelineEvents.$inferSelect;
export type AiSuggestion = typeof aiSuggestions.$inferSelect;

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Relations
export const userRelations = relations(users, ({ many }) => ({
  projects: many(projects),
}));

export const projectRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  chapters: many(chapters),
  characters: many(characters),
  locations: many(locations),
  timelineEvents: many(timelineEvents),
  aiSuggestions: many(aiSuggestions),
}));

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertChapter = z.infer<typeof insertChapterSchema>;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type InsertTimelineEvent = z.infer<typeof insertTimelineEventSchema>;
export type InsertAiSuggestion = z.infer<typeof insertAiSuggestionSchema>;
