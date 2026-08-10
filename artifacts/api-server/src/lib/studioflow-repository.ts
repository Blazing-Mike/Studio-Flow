import {
  db,
  studioflowJobProposalDrafts,
  studioflowProjects,
  studioflowProposals,
  type StudioflowJobProposalDraftRow,
} from "@workspace/db";
import { asc, eq, type SQL } from "drizzle-orm";
import {
  projects as seedProjects,
  type StudioProject,
} from "./studioflow-data";

type ProjectRow = typeof studioflowProjects.$inferSelect;
type ProposalRow = typeof studioflowProposals.$inferSelect;

function projectRow(project: StudioProject): typeof studioflowProjects.$inferInsert {
  return {
    id: project.id,
    clientName: project.clientName,
    clientEmail: project.clientEmail,
    name: project.name,
    type: project.type,
    status: project.status,
    budget: project.budget,
    deadline: project.deadline,
    progress: project.progress,
    accent: project.accent,
    initials: project.initials,
    shareToken: project.shareToken,
    goals: project.goals,
    notes: project.notes,
    packages: project.packages,
    milestones: project.milestones,
    tasks: project.tasks,
    invoices: project.invoices,
    activities: project.activities,
  };
}

function proposalRow(project: StudioProject): typeof studioflowProposals.$inferInsert {
  return {
    projectId: project.id,
    status: project.proposal.status,
    headline: project.proposal.headline,
    body: project.proposal.body,
    selectedPackage: project.proposal.selectedPackage,
  };
}

function fromRows(row: ProjectRow, proposal: ProposalRow | undefined): StudioProject {
  return {
    id: row.id,
    clientName: row.clientName,
    clientEmail: row.clientEmail,
    name: row.name,
    type: row.type,
    status: row.status,
    budget: row.budget,
    deadline: row.deadline,
    progress: row.progress,
    accent: row.accent,
    initials: row.initials,
    shareToken: row.shareToken,
    goals: row.goals,
    notes: row.notes,
    proposal: {
      status: proposal?.status ?? "Draft",
      headline: proposal?.headline ?? "",
      body: proposal?.body ?? "",
      selectedPackage: proposal?.selectedPackage ?? null,
    },
    packages: row.packages as StudioProject["packages"],
    milestones: row.milestones as StudioProject["milestones"],
    tasks: row.tasks as StudioProject["tasks"],
    invoices: row.invoices as StudioProject["invoices"],
    activities: row.activities as StudioProject["activities"],
  };
}

async function findWithProposal(where: SQL) {
  const rows = await db
    .select({
      project: studioflowProjects,
      proposal: studioflowProposals,
    })
    .from(studioflowProjects)
    .leftJoin(
      studioflowProposals,
      eq(studioflowProposals.projectId, studioflowProjects.id),
    )
    .where(where);
  const first = rows[0];
  return first ? fromRows(first.project, first.proposal ?? undefined) : undefined;
}

export async function initializeStudioflowDatabase() {
  const existing = await db
    .select({ id: studioflowProjects.id })
    .from(studioflowProjects)
    .limit(1);
  if (existing.length > 0) return;

  await db.transaction(async (tx) => {
    for (const project of seedProjects) {
      await tx.insert(studioflowProjects).values(projectRow(project));
      await tx.insert(studioflowProposals).values(proposalRow(project));
    }
  });
}

export async function listProjects() {
  const rows = await db
    .select({
      project: studioflowProjects,
      proposal: studioflowProposals,
    })
    .from(studioflowProjects)
    .leftJoin(
      studioflowProposals,
      eq(studioflowProposals.projectId, studioflowProjects.id),
    )
    .orderBy(asc(studioflowProjects.name));
  return rows.map((row) => fromRows(row.project, row.proposal ?? undefined));
}

export async function getProject(id: string) {
  return findWithProposal(eq(studioflowProjects.id, id));
}

export async function getProjectByShareToken(token: string) {
  return findWithProposal(eq(studioflowProjects.shareToken, token));
}

export async function saveProject(project: StudioProject) {
  await db.transaction(async (tx) => {
    await tx
      .insert(studioflowProjects)
      .values(projectRow(project))
      .onConflictDoUpdate({
        target: studioflowProjects.id,
        set: {
          clientName: project.clientName,
          clientEmail: project.clientEmail,
          name: project.name,
          type: project.type,
          status: project.status,
          budget: project.budget,
          deadline: project.deadline,
          progress: project.progress,
          accent: project.accent,
          initials: project.initials,
          shareToken: project.shareToken,
          goals: project.goals,
          notes: project.notes,
          packages: project.packages,
          milestones: project.milestones,
          tasks: project.tasks,
          invoices: project.invoices,
          activities: project.activities,
        },
      });
    await tx
      .insert(studioflowProposals)
      .values(proposalRow(project))
      .onConflictDoUpdate({
        target: studioflowProposals.projectId,
        set: {
          status: project.proposal.status,
          headline: project.proposal.headline,
          body: project.proposal.body,
          selectedPackage: project.proposal.selectedPackage,
        },
      });
  });
  return project;
}

export async function archiveProject(project: StudioProject) {
  await db
    .update(studioflowProjects)
    .set({ status: "Archived" })
    .where(eq(studioflowProjects.id, project.id));
}

function draftFromRow(row: StudioflowJobProposalDraftRow) {
  return {
    id: row.id,
    proposal: row.proposal,
    source: row.source,
    createdAt: row.createdAt,
    ...(row.title ? { title: row.title } : {}),
    ...(row.org ? { org: row.org } : {}),
    ...(row.url ? { url: row.url } : {}),
    ...(row.tone ? { tone: row.tone } : {}),
    ...(row.length ? { length: row.length } : {}),
  };
}

export async function listJobProposalDrafts() {
  const rows = await db
    .select()
    .from(studioflowJobProposalDrafts)
    .orderBy(asc(studioflowJobProposalDrafts.createdAt));
  return rows.reverse().map(draftFromRow);
}

export async function saveJobProposalDraft(draft: {
  id: string;
  proposal: string;
  source: string;
  createdAt: string;
  title?: string;
  org?: string;
  url?: string;
  tone?: string;
  length?: string;
}) {
  await db.insert(studioflowJobProposalDrafts).values({
    id: draft.id,
    proposal: draft.proposal,
    source: draft.source,
    createdAt: draft.createdAt,
    title: draft.title,
    org: draft.org,
    url: draft.url,
    tone: draft.tone,
    length: draft.length,
  });
}

export async function deleteJobProposalDraft(id: string) {
  const deleted = await db
    .delete(studioflowJobProposalDrafts)
    .where(eq(studioflowJobProposalDrafts.id, id))
    .returning({ id: studioflowJobProposalDrafts.id });
  return deleted.length > 0;
}