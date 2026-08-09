import {
  DeleteJobProposalParams,
  GenerateJobProposalBody,
  GenerateJobProposalResponse,
  GetJobProposalsResponse,
} from "@workspace/api-zod";
import { Router, type IRouter } from "express";
import {
  fetchJobFromUrl,
  writeProposal,
  type JobInfo,
  type JobProfile,
  type ProposalLength,
  type ProposalTone,
} from "../lib/job-proposal";

const router: IRouter = Router();

const defaultProfile: JobProfile = {
  name: "Alex Lee",
  studio: "Alex Lee Studio",
  email: "hello@alexlee.studio",
  bio: "Independent brand designer helping thoughtful businesses find their point of view.",
};

type ProposalDraft = {
  id: string;
  proposal: string;
  source: string;
  createdAt: string;
  title?: string;
  org?: string;
  url?: string;
  tone?: string;
  length?: string;
};

// In-memory saved drafts (consistent with the rest of the API's in-memory store).
const drafts: ProposalDraft[] = [];

/**
 * POST /api/job-proposals/generate
 * Draft a proposal for a job posting.
 * Body: { url?: string, description?: string, profile?: { name, studio, email, bio } }
 *
 * - If `description` is provided it is used directly.
 * - Otherwise `url` is fetched and the posting is extracted (JSON-LD JobPosting).
 * - If neither yields content, responds with `needsDescription: true` so the
 *   client can ask the user to paste the posting text.
 */
router.post("/job-proposals/generate", async (req, res) => {
  const parsed = GenerateJobProposalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { url, description, tone, length, profile } = parsed.data;
  const userProfile: JobProfile = {
    name: profile?.name?.trim() || defaultProfile.name,
    studio: profile?.studio?.trim() || defaultProfile.studio,
    email: profile?.email?.trim() || defaultProfile.email,
    bio: profile?.bio?.trim() || defaultProfile.bio,
    portfolio: profile?.portfolio?.trim() || undefined,
  };
  const options = {
    tone: (tone ?? "confident") as ProposalTone,
    length: (length ?? "standard") as ProposalLength,
  };

  // 1) Resolve the job content.
  let job: JobInfo | null = null;
  if (description?.trim()) {
    job = {
      title: "Freelance opportunity",
      org: "",
      url: url?.trim() ?? "",
      description: description.trim(),
    };
  } else if (url?.trim()) {
    job = await fetchJobFromUrl(url.trim());
  }

  if (!job) {
    res.json(
      GenerateJobProposalResponse.parse({
        proposal: "",
        source: "template",
        needsDescription: true,
      }),
    );
    return;
  }

  // 2) Write the proposal and auto-save to history.
  const { proposal, source } = await writeProposal(job, userProfile, options);
  const draft: ProposalDraft = {
    id: `draft-${Date.now()}`,
    proposal,
    source,
    createdAt: new Date().toISOString(),
    title: job.title,
    org: job.org || undefined,
    url: job.url || undefined,
    tone: options.tone,
    length: options.length,
  };
  if (proposal.trim()) drafts.unshift(draft);

  res.json(
    GenerateJobProposalResponse.parse({
      proposal,
      source,
      needsDescription: false,
      draft,
      job,
    }),
  );
});

/**
 * GET /api/job-proposals
 * List saved proposal drafts (newest first).
 */
router.get("/job-proposals", (_req, res) => {
  res.json(GetJobProposalsResponse.parse(drafts));
});

/**
 * DELETE /api/job-proposals/:id
 * Delete a saved proposal draft.
 */
router.delete("/job-proposals/:id", (req, res) => {
  const params = DeleteJobProposalParams.safeParse(req.params);
  const index = params.success
    ? drafts.findIndex((d) => d.id === params.data.id)
    : -1;
  if (index === -1) {
    res.status(404).json({ error: "Draft not found" });
    return;
  }
  drafts.splice(index, 1);
  res.status(204).send();
});

export default router;
