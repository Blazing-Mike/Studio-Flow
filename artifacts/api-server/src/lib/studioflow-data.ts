import { generatePlan, type Brief } from "./ai-generate";
import {
  detail,
  getProject,
  project,
  projects,
  type StudioProject,
} from "@workspace/demo-data";

export { detail, getProject, projects };
export type { StudioProject };

export async function createFromBrief(input: Brief) {
  const initials = input.clientName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const id = `${input.clientName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`;
  const created = project({
    id,
    clientName: input.clientName,
    clientEmail: input.clientEmail,
    name: input.name,
    type: input.type,
    status: "Draft",
    budget: input.budget,
    deadline: input.deadline,
    progress: 0,
    accent: "#8BA4C8",
    initials,
    shareToken: id,
    goals: input.goals,
    notes: input.notes ?? "",
    proposal: {
      status: "Draft",
      headline: `A focused plan for ${input.clientName}`,
      body: `We'll turn your goals into a clear, confident ${input.type.toLowerCase()} experience with thoughtful milestones and a steady path to launch.`,
      selectedPackage: null,
    },
    milestones: [
      {
        id: `${id}-1`,
        name: "Discovery & direction",
        date: input.deadline,
        status: "upcoming",
      },
      {
        id: `${id}-2`,
        name: "Core production",
        date: input.deadline,
        status: "upcoming",
      },
      {
        id: `${id}-3`,
        name: "Launch & handoff",
        date: input.deadline,
        status: "upcoming",
      },
    ],
    tasks: [
      {
        id: `${id}-task-1`,
        title: "Review generated project plan",
        phase: "Discovery",
        status: "To Do",
        dueDate: input.deadline,
        assignee: "You",
      },
      {
        id: `${id}-task-2`,
        title: "Share first direction",
        phase: "Production",
        status: "To Do",
        dueDate: input.deadline,
        assignee: "You",
      },
    ],
    invoices: [
      {
        id: `${id}-invoice-1`,
        number: `INV-${Math.floor(1100 + Math.random() * 200)}`,
        amount: Math.round(input.budget / 2),
        dueDate: input.deadline,
        status: "Outstanding",
        description: "Project deposit",
      },
    ],
    activities: [
      {
        id: `${id}-activity-1`,
        actor: "You",
        action: "created the project brief",
        time: "Just now",
        type: "created",
      },
    ],
  });

  // Prefer an AI-generated plan; fall back to the local mock above on any failure.
  const generated = await generatePlan(input);
  if (generated) {
    created.proposal = { status: "Draft", ...generated.proposal };
    created.packages = generated.packages;
    created.milestones = generated.milestones;
    created.tasks = generated.tasks;
  }

  projects.unshift(created);
  return created;
}
