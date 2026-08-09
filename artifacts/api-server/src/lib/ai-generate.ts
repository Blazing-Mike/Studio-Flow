import { chatCompletion, llmConfigured } from "./llm";
import type { StudioProject } from "./studioflow-data";

/**
 * AI-assisted project plan generation.
 *
 * Uses the shared OpenAI-compatible chat client (lib/llm.ts). If no API key is
 * configured, or a call fails, callers fall back to the local mock generator in
 * studioflow-data.ts.
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

const SYSTEM_PROMPT = `You are StudioFlow, a planning engine for independent creative studios. Given a client brief, you produce a complete project plan as a single JSON object. Output ONLY valid JSON — no markdown fences, no commentary.

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

/** Extract the first balanced JSON object from model output (robust to stray prose). */
function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fence ? fence[1].trim() : trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in model output");
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asBool(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function slug(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || `item-${Date.now()}`
  );
}

const TASK_STATUSES = ["To Do", "In Progress", "Review", "Done"] as const;
const MILESTONE_STATUSES = ["upcoming", "current", "complete"] as const;

/** Validate and normalize raw model output into a safe GeneratedPlan. Throws if unusable. */
function normalizePlan(raw: unknown): GeneratedPlan {
  if (!isRecord(raw)) throw new Error("Plan is not an object");
  const proposalRaw = raw["proposal"];
  const packagesRaw = raw["packages"];
  const milestonesRaw = raw["milestones"];
  const tasksRaw = raw["tasks"];

  if (!isRecord(proposalRaw)) throw new Error("Proposal missing");
  if (!Array.isArray(packagesRaw) || packagesRaw.length < 3)
    throw new Error("Packages missing");
  if (!Array.isArray(milestonesRaw) || milestonesRaw.length < 1)
    throw new Error("Milestones missing");
  if (!Array.isArray(tasksRaw) || tasksRaw.length < 1)
    throw new Error("Tasks missing");

  const headline = asString(proposalRaw["headline"]);
  const body = asString(proposalRaw["body"]);
  if (!headline || !body) throw new Error("Proposal text missing");

  const packages = packagesRaw.slice(0, 4).map((p) => {
    const rec = isRecord(p) ? p : {};
    const id = asString(rec["id"], slug(asString(rec["name"])));
    return {
      id,
      name: asString(rec["name"], id),
      price: asNumber(rec["price"], 0),
      description: asString(rec["description"]),
      features: Array.isArray(rec["features"])
        ? rec["features"]
            .map((f) => asString(f))
            .filter(Boolean)
            .slice(0, 8)
        : [],
      recommended: asBool(rec["recommended"]),
    };
  });
  const recommendedIds = packages.filter((p) => p.recommended).map((p) => p.id);
  if (recommendedIds.length === 0)
    packages[Math.min(1, packages.length - 1)] = {
      ...packages[Math.min(1, packages.length - 1)],
      recommended: true,
    };

  const milestones = milestonesRaw
    .slice(0, 8)
    .map((m) => {
      const rec = isRecord(m) ? m : {};
      const name = asString(rec["name"]);
      const status = asString(rec["status"]).toLowerCase();
      return {
        id: asString(rec["id"], slug(name)),
        name,
        date: asString(rec["date"]).slice(0, 10),
        status: (MILESTONE_STATUSES as readonly string[]).includes(status)
          ? status
          : "upcoming",
      };
    })
    .filter((m) => m.name);

  const tasks = tasksRaw
    .slice(0, 12)
    .map((t) => {
      const rec = isRecord(t) ? t : {};
      const title = asString(rec["title"]);
      const status = asString(rec["status"]);
      return {
        id: asString(rec["id"], slug(title)),
        title,
        phase: asString(rec["phase"], "Production"),
        status: (TASK_STATUSES as readonly string[]).includes(status)
          ? status
          : "To Do",
        dueDate: asString(rec["dueDate"]).slice(0, 10),
        assignee: asString(rec["assignee"], "You"),
      };
    })
    .filter((t) => t.title);

  if (milestones.length === 0) throw new Error("No milestones");
  if (tasks.length === 0) throw new Error("No tasks");

  const selectedPackage = asString(proposalRaw["selectedPackage"]);
  return {
    proposal: {
      headline,
      body,
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
    const content = await chatCompletion(
      [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(brief) },
      ],
      { temperature: 0.7, json: true },
    );
    if (!content) return null;
    return normalizePlan(extractJson(content));
  } catch (error) {
    console.error(
      "[ai-generate] generation failed, falling back to mock:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}
