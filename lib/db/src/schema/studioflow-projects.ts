import { integer, jsonb, pgTable, text } from "drizzle-orm/pg-core";

export const studioflowProjects = pgTable("studioflow_projects", {
  id: text("id").primaryKey(),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull(),
  budget: integer("budget").notNull(),
  deadline: text("deadline").notNull(),
  progress: integer("progress").notNull().default(0),
  accent: text("accent").notNull(),
  initials: text("initials").notNull(),
  shareToken: text("share_token").notNull().unique(),
  goals: text("goals").notNull(),
  notes: text("notes").notNull(),
  packages: jsonb("packages").notNull().default([]),
  milestones: jsonb("milestones").notNull().default([]),
  tasks: jsonb("tasks").notNull().default([]),
  invoices: jsonb("invoices").notNull().default([]),
  activities: jsonb("activities").notNull().default([]),
});

export type StudioflowProjectRow = typeof studioflowProjects.$inferSelect;
export type NewStudioflowProjectRow = typeof studioflowProjects.$inferInsert;