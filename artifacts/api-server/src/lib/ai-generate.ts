import {
  generateText,
  NoObjectGeneratedError,
  Output,
  streamText,
} from "ai";
import { z } from "zod";
import { llmConfigured, llmModel } from "./llm";
import type { StudioProject } from "./studioflow-data";

/**
 * AI-assisted project plan generation.
 *
 * Built on the Vercel AI SDK: `generateText` with `Output.object` and a Zod
 * schema gets validated JSON back directly (no manual JSON extraction). The
 * schema stays tolerant of model drift — in `json_object` mode the wire
 * format doesn't carry the schema, so the model is guided by the prompt's
 * explicit shape and `normalizePlan` applies the domain rules on top. If no
 * API key is configured, or a call fails, callers fall back to the local mock
 * generator in studioflow-data.ts.
 */

export type Brief = {
  clientName: string;
  clientEmail: string;
  name: string;
  type: string;
  goals: string;
  budget: number;
  deadline: string;
  notes?: string;
};

export type GeneratedPlan = {
  proposal: {
    headline: string;
    body: string;
    selectedPackage: string | null;
  };
  packages: NonNullable<StudioProject["packages"]>;
  milestones: NonNullable<StudioProject["milestones"]>;
  tasks: NonNullable<StudioProject["tasks"]>;
};

export const aiConfigured = llmConfigured;

const planSchema = z.object({
  proposal: z.object({
    headline: z.string(),
    body: z.string(),
    selectedPackage: z.string(),
  }),
  packages: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        price: z.union([z.number(), z.string()]),
        description: z.string().optional(),
        features: z.array(z.string()).optional(),
        recommended: z.boolean().optional(),
      }),
    )
    .min(3)
    .max(4),
  milestones: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        title: z.string().optional(),
        date: z.string(),
        status: z.string().optional(),
      }),
    )
    .min(1)
    .max(8),
  tasks: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        phase: z.string().optional(),
        status: z.string().optional(),
        dueDate: z.string().optional(),
        assignee: z.string().optional(),
      }),
    )
    .min(1)
    .max(12),
});

type PlanObject = z.infer<typeof planSchema>;

const SYSTEM_PROMPT = `You are StudioFlow, a planning engine for independent creative studios. Given a client brief, you produce a complete project plan as a single JSON object.

The JSON must match exactly this shape:
{
  "proposal": { "headline": string, "body": string, "selectedPackage": "starter" | "growth" | "signature" },
  "packages": [
    { "id": "starter", "name": string, "price": number, "description": string, "features": [string], "recommended": boolean }
  ],
  "milestones": [
    { "id": string, "name": string, "date": "YYYY-MM-DD", "status": "upcoming" | "current" | "complete" }
  ],
  "tasks": [
    { "id": string, "title": string, "phase": string, "status": "To Do" | "In Progress" | "Review" | "Done", "dueDate": "YYYY-MM-DD", "assignee": string }
  ]
}

Rules:
- Provide exactly 3 packages using the ids "starter", "growth", "signature". Prices in USD, sensible around the client's budget. Mark exactly one (usually "growth") as recommended.
- Provide 3-6 milestones spanning from the start date to the target deadline. Earliest should be "complete", the currently active one "current", and later ones "upcoming".
- Provide 5-8 tasks spread across milestone phases. Mostly "To Do" and "In Progress", a couple "Review", at most one "Done". Assignees from: "You", "Maya", "Lena", "Nora".
- proposal.headline: a short, confident, benefit-led sentence (under ~90 characters). proposal.body: 2-4 substantive sentences. selectedPackage should reference the recommended package id.
- All dates must be valid ISO dates (YYYY-MM-DD) and must fall between the start date and the target deadline.
- Every string must be professional and specific to the client's brief.`;

function buildUserPrompt(brief: Brief): string {
  const today = new Date().toISOString().slice(0, 10);
  return `Client brief (JSON):
${JSON.stringify({ ...brief, startDate: today }, null, 2)}

Today's date is ${today}. Produce the project plan JSON now.`;
}

function slug(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || `item-${Date.now()}`
  );
}

const TASK_STATUSES = ["To Do", "In Progress", "Review", "Done"];
const MILESTONE_STATUSES = ["upcoming", "current", "complete"];

function asNumber(value: number | string, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** Domain-level cleanup on top of schema validation. */
function normalizePlan(plan: PlanObject): GeneratedPlan {
  const packages = plan.packages.map((p) => ({
    id: p.id.trim() || slug(p.name),
    name: p.name.trim(),
    price: asNumber(p.price),
    description: (p.description ?? "").trim(),
    features: (p.features ?? []).map((f) => f.trim()).filter(Boolean),
    recommended: p.recommended ?? false,
  }));
  const recommendedIds = packages
    .filter((p) => p.recommended)
    .map((p) => p.id);
  if (recommendedIds.length === 0) {
    const index = Math.min(1, packages.length - 1);
    packages[index] = { ...packages[index], recommended: true };
  }
  const selectedPackage = plan.proposal.selectedPackage;
  const milestones = plan.milestones
    .map((m) => ({
      id: m.id.trim() || slug(m.name ?? m.title ?? ""),
      name: (m.name ?? m.title ?? "").trim(),
      date: m.date.slice(0, 10),
      status: MILESTONE_STATUSES.includes((m.status ?? "").toLowerCase())
        ? (m.status as string).toLowerCase()
        : "upcoming",
    }))
    .filter((m) => m.name);
  const tasks = plan.tasks
    .map((t) => ({
      id: t.id.trim() || slug(t.title),
      title: t.title.trim(),
      phase: (t.phase ?? "Production").trim(),
      status: TASK_STATUSES.includes(t.status ?? "") ? (t.status as string) : "To Do",
      dueDate: (t.dueDate ?? "").slice(0, 10),
      assignee: (t.assignee ?? "You").trim(),
    }))
    .filter((t) => t.title);
  if (milestones.length === 0) throw new Error("No milestones");
  if (tasks.length === 0) throw new Error("No tasks");

  return {
    proposal: {
      headline: plan.proposal.headline,
      body: plan.proposal.body,
      selectedPackage: packages.some((p) => p.id === selectedPackage)
        ? selectedPackage
        : (recommendedIds[0] ?? packages[0].id),
    },
    packages,
    milestones,
    tasks,
  };
}

/**
 * Generate a project plan from a brief. Returns null when AI is not configured
 * or generation/validation fails, so callers can fall back to the mock plan.
 */
export async function generatePlan(
  brief: Brief,
): Promise<GeneratedPlan | null> {
  if (!aiConfigured()) return null;

  try {
    const result = await generateText({
      model: llmModel(),
      instructions: SYSTEM_PROMPT,
      prompt: buildUserPrompt(brief),
      temperature: 0.7,
      maxOutputTokens: 4096,
      timeout: 60000,
      output: Output.object({ schema: planSchema }),
    });
    return normalizePlan(result.output);
  } catch (error) {
    const rawText =
      error instanceof NoObjectGeneratedError ? error.text : undefined;
    console.error(
      "[ai-generate] generation failed, falling back to mock:",
      error instanceof Error ? error.message : error,
      rawText ? `\nmodel text: ${rawText.slice(0, 1200)}` : "",
    );
    return null;
  }
}

export type PlanPhase =
  | "proposal"
  | "packages"
  | "milestones"
  | "tasks"
  | "done";

/**
 * Stream a project plan from a brief, reporting each completed section via
 * `onProgress` as the model writes it. Returns the validated plan, or null on
 * failure/not-configured so the caller can keep the existing plan.
 */
export async function streamPlan(
  brief: Brief,
  onProgress: (phase: PlanPhase) => void,
): Promise<GeneratedPlan | null> {
  if (!aiConfigured()) return null;

  const result = streamText({
    model: llmModel(),
    instructions: SYSTEM_PROMPT,
    prompt: buildUserPrompt(brief),
    temperature: 0.7,
    maxOutputTokens: 4096,
    timeout: 60000,
    output: Output.object({ schema: planSchema }),
  });

  try {
    let phase: PlanPhase = "proposal";
    for await (const partial of result.partialOutputStream) {
      const next: PlanPhase = partial.tasks?.length
        ? "tasks"
        : partial.milestones?.length
          ? "milestones"
          : partial.packages?.length
            ? "packages"
            : "proposal";
      if (next !== phase) {
        phase = next;
        onProgress(next);
      }
    }
    const plan = normalizePlan(await result.output);
    onProgress("done");
    return plan;
  } catch (error) {
    console.error(
      "[ai-generate] streaming generation failed:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}
