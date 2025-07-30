import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  documentId: varchar("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  role: text("role"),
  age: text("age"),
  appearance: text("appearance"),
  traits: text("traits"),
  relationships: jsonb("relationships").default("[]"),
  lastMentioned: text("last_mentioned"),
});

export const locations = pgTable("locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type"),
  description: text("description"),
  keyFeatures: text("key_features"),
  firstMentioned: text("first_mentioned"),
});

export const timelineEvents = pgTable("timeline_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  chapter: text("chapter"),
  description: text("description"),
  order: integer("order").notNull(),
});

export const aiSuggestions = pgTable("ai_suggestions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'synonym', 'grammar', 'style', 'plot'
  originalText: text("original_text").notNull(),
  suggestion: text("suggestion").notNull(),
  position: integer("position").notNull(),
  applied: boolean("applied").default(false),
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

export type Document = typeof documents.$inferSelect;
export type Character = typeof characters.$inferSelect;
export type Location = typeof locations.$inferSelect;
export type TimelineEvent = typeof timelineEvents.$inferSelect;
export type AiSuggestion = typeof aiSuggestions.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type InsertTimelineEvent = z.infer<typeof insertTimelineEventSchema>;
export type InsertAiSuggestion = z.infer<typeof insertAiSuggestionSchema>;
