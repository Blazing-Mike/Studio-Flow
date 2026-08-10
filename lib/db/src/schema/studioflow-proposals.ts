import { pgTable, text } from "drizzle-orm/pg-core";
import { studioflowProjects } from "./studioflow-projects";

export const studioflowProposals = pgTable("studioflow_proposals", {
  projectId: text("project_id")
    .primaryKey()
    .references(() => studioflowProjects.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  headline: text("headline").notNull(),
  body: text("body").notNull(),
  selectedPackage: text("selected_package"),
});

export type StudioflowProposalRow = typeof studioflowProposals.$inferSelect;
export type NewStudioflowProposalRow = typeof studioflowProposals.$inferInsert;