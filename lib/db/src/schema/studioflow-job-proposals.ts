import { pgTable, text } from "drizzle-orm/pg-core";

export const studioflowJobProposalDrafts = pgTable("studioflow_job_proposal_drafts", {
  id: text("id").primaryKey(),
  proposal: text("proposal").notNull(),
  source: text("source").notNull(),
  createdAt: text("created_at").notNull(),
  title: text("title"),
  org: text("org"),
  url: text("url"),
  tone: text("tone"),
  length: text("length"),
});

export type StudioflowJobProposalDraftRow =
  typeof studioflowJobProposalDrafts.$inferSelect;
export type NewStudioflowJobProposalDraftRow =
  typeof studioflowJobProposalDrafts.$inferInsert;