import { generatePlan, type Brief } from "./ai-generate";

export type StudioProject = {
  id: string;
  clientName: string;
  clientEmail: string;
  name: string;
  type: string;
  status: string;
  budget: number;
  deadline: string;
  progress: number;
  accent: string;
  initials: string;
  shareToken: string;
  goals: string;
  notes: string;
  proposal: {
    status: string;
    headline: string;
    body: string;
    selectedPackage: string | null;
  };
  packages: Array<{
    id: string;
    name: string;
    price: number;
    description: string;
    features: string[];
    recommended: boolean;
  }>;
  milestones: Array<{ id: string; name: string; date: string; status: string }>;
  tasks: Array<{
    id: string;
    title: string;
    phase: string;
    status: string;
    dueDate: string;
    assignee: string;
  }>;
  invoices: Array<{
    id: string;
    number: string;
    amount: number;
    dueDate: string;
    status: string;
    description: string;
  }>;
  activities: Array<{
    id: string;
    actor: string;
    action: string;
    time: string;
    type: string;
  }>;
};

const sharedPackages = [
  {
    id: "starter",
    name: "Starter",
    price: 2800,
    description: "A focused foundation for a confident launch.",
    features: [
      "Strategy workshop",
      "Core visual direction",
      "Responsive landing page",
    ],
    recommended: false,
  },
  {
    id: "growth",
    name: "Growth",
    price: 4800,
    description: "A complete brand and digital experience.",
    features: [
      "Everything in Starter",
      "Full brand identity",
      "Five-page website",
      "Launch support",
    ],
    recommended: true,
  },
  {
    id: "signature",
    name: "Signature",
    price: 7200,
    description: "A high-touch partnership for ambitious teams.",
    features: [
      "Everything in Growth",
      "Motion system",
      "Content direction",
      "90-day optimization",
    ],
    recommended: false,
  },
];

const project = (
  values: Omit<StudioProject, "packages"> & {
    packages?: StudioProject["packages"];
  },
): StudioProject => ({
  ...values,
  packages: values.packages ?? structuredClone(sharedPackages),
});

/** ISO date (YYYY-MM-DD) `n` days from today — keeps demo seed data looking current. */
const daysFromNow = (n: number) => {
  const d = new Date(Date.now() + n * 86_400_000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const projects: StudioProject[] = [
  project({
    id: "northstar",
    clientName: "Northstar Coffee",
    clientEmail: "hello@northstar.coffee",
    name: "Brand & ecommerce refresh",
    type: "Brand + Web",
    status: "In progress",
    budget: 4800,
    deadline: daysFromNow(19),
    progress: 68,
    accent: "#E8A86B",
    initials: "NC",
    shareToken: "northstar-coffee",
    goals:
      "Create a warmer, more premium digital home for Northstar's single-origin coffee subscription.",
    notes:
      "The founders want the work to feel considered, tactile, and welcoming without becoming precious.",
    proposal: {
      status: "Approved",
      headline: "A warmer digital home for your daily ritual",
      body: "Northstar has already built a beautiful product. This project gives that product a digital experience with the same care: a confident identity, a clearer subscription story, and an ecommerce flow that makes discovery feel effortless.",
      selectedPackage: "growth",
    },
    milestones: [
      {
        id: "n1",
        name: "Discovery & direction",
        date: daysFromNow(-32),
        status: "complete",
      },
      {
        id: "n2",
        name: "Identity system",
        date: daysFromNow(-18),
        status: "complete",
      },
      {
        id: "n3",
        name: "Website design",
        date: daysFromNow(3),
        status: "current",
      },
      {
        id: "n4",
        name: "Launch & handoff",
        date: daysFromNow(19),
        status: "upcoming",
      },
    ],
    tasks: [
      {
        id: "nt1",
        title: "Finalize homepage art direction",
        phase: "Website design",
        status: "In Progress",
        dueDate: daysFromNow(-7),
        assignee: "You",
      },
      {
        id: "nt2",
        title: "Review subscription flow",
        phase: "Website design",
        status: "Review",
        dueDate: daysFromNow(-4),
        assignee: "Maya",
      },
      {
        id: "nt3",
        title: "Prepare launch checklist",
        phase: "Launch & handoff",
        status: "To Do",
        dueDate: daysFromNow(11),
        assignee: "You",
      },
      {
        id: "nt4",
        title: "Approve identity direction",
        phase: "Identity system",
        status: "Done",
        dueDate: daysFromNow(-21),
        assignee: "Lena",
      },
    ],
    invoices: [
      {
        id: "ni1",
        number: "INV-1048",
        amount: 2400,
        dueDate: daysFromNow(-28),
        status: "Paid",
        description: "50% project deposit",
      },
      {
        id: "ni2",
        number: "INV-1062",
        amount: 2400,
        dueDate: daysFromNow(19),
        status: "Outstanding",
        description: "Final project balance",
      },
    ],
    activities: [
      {
        id: "na1",
        actor: "Lena Park",
        action: "approved the identity direction",
        time: "2 hours ago",
        type: "approval",
      },
      {
        id: "na2",
        actor: "You",
        action: "shared website design concepts",
        time: "Yesterday",
        type: "share",
      },
      {
        id: "na3",
        actor: "Lena Park",
        action: "commented on the subscription flow",
        time: "2 days ago",
        type: "comment",
      },
    ],
  }),
  project({
    id: "meridian",
    clientName: "Meridian Health",
    clientEmail: "team@meridian.health",
    name: "Patient experience strategy",
    type: "Strategy",
    status: "Proposal sent",
    budget: 3600,
    deadline: daysFromNow(34),
    progress: 18,
    accent: "#A0B7A4",
    initials: "MH",
    shareToken: "meridian-health",
    goals:
      "Make Meridian's patient journey feel less fragmented and more human.",
    notes:
      "The team is preparing for a regional expansion and needs a clear, shared service vision.",
    proposal: {
      status: "Sent",
      headline: "A patient experience people can trust",
      body: "Together, we'll map the moments that matter, identify the friction that gets in the way, and turn the findings into a practical service direction Meridian can grow with.",
      selectedPackage: null,
    },
    milestones: [
      {
        id: "m1",
        name: "Proposal review",
        date: daysFromNow(5),
        status: "current",
      },
      {
        id: "m2",
        name: "Research sprint",
        date: daysFromNow(14),
        status: "upcoming",
      },
      {
        id: "m3",
        name: "Strategy readout",
        date: daysFromNow(34),
        status: "upcoming",
      },
    ],
    tasks: [
      {
        id: "mt1",
        title: "Follow up on proposal",
        phase: "Proposal",
        status: "To Do",
        dueDate: daysFromNow(1),
        assignee: "You",
      },
      {
        id: "mt2",
        title: "Prepare research plan",
        phase: "Research sprint",
        status: "To Do",
        dueDate: daysFromNow(10),
        assignee: "You",
      },
    ],
    invoices: [
      {
        id: "mi1",
        number: "INV-1071",
        amount: 1800,
        dueDate: daysFromNow(5),
        status: "Outstanding",
        description: "Project deposit",
      },
    ],
    activities: [
      {
        id: "ma1",
        actor: "You",
        action: "sent a proposal to the Meridian team",
        time: "Yesterday",
        type: "share",
      },
      {
        id: "ma2",
        actor: "Sam Rivera",
        action: "viewed the proposal",
        time: "Yesterday",
        type: "view",
      },
    ],
  }),
  project({
    id: "sundays",
    clientName: "Sundays Studio",
    clientEmail: "hello@sundays.studio",
    name: "Seasonal campaign",
    type: "Campaign",
    status: "In progress",
    budget: 2400,
    deadline: daysFromNow(11),
    progress: 42,
    accent: "#C9B6E4",
    initials: "SS",
    shareToken: "sundays-studio",
    goals:
      "Build a flexible campaign system for Sundays' late-summer collection.",
    notes:
      "Keep the campaign expressive and tactile while giving the small team a clear toolkit to reuse.",
    proposal: {
      status: "Approved",
      headline: "A campaign system with room to breathe",
      body: "A focused creative system for the late-summer collection, designed to feel expressive now and useful long after launch.",
      selectedPackage: "starter",
    },
    milestones: [
      {
        id: "s1",
        name: "Creative direction",
        date: daysFromNow(-7),
        status: "complete",
      },
      {
        id: "s2",
        name: "Campaign production",
        date: daysFromNow(5),
        status: "current",
      },
      { id: "s3", name: "Launch", date: daysFromNow(11), status: "upcoming" },
    ],
    tasks: [
      {
        id: "st1",
        title: "Select final campaign frames",
        phase: "Production",
        status: "In Progress",
        dueDate: daysFromNow(-7),
        assignee: "Maya",
      },
      {
        id: "st2",
        title: "Export social toolkit",
        phase: "Production",
        status: "To Do",
        dueDate: daysFromNow(-3),
        assignee: "You",
      },
      {
        id: "st3",
        title: "Review creative direction",
        phase: "Direction",
        status: "Done",
        dueDate: daysFromNow(-12),
        assignee: "Nora",
      },
    ],
    invoices: [
      {
        id: "si1",
        number: "INV-1056",
        amount: 1200,
        dueDate: daysFromNow(-8),
        status: "Paid",
        description: "Project deposit",
      },
      {
        id: "si2",
        number: "INV-1067",
        amount: 1200,
        dueDate: daysFromNow(11),
        status: "Outstanding",
        description: "Final project balance",
      },
    ],
    activities: [
      {
        id: "sa1",
        actor: "Nora Kim",
        action: "approved the creative direction",
        time: "4 days ago",
        type: "approval",
      },
      {
        id: "sa2",
        actor: "You",
        action: "uploaded campaign frames",
        time: "5 days ago",
        type: "share",
      },
    ],
  }),
];

export const detail = (item: StudioProject) => item;

export function getProject(id: string) {
  return projects.find((item) => item.id === id);
}

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
