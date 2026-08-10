import {
  ApproveProposalBody,
  CreateInvoiceBody,
  CreateMilestoneBody,
  CreateProjectBody,
  CreateTaskBody,
  GetClientPortalParams,
  GetDashboardResponse,
  GetProjectParams,
  GetProjectResponse,
  GetProjectsQueryParams,
  GetProjectsResponse,
  RequestProposalChangesBody,
  UpdateInvoiceBody,
  UpdateMilestoneBody,
  UpdateProjectBody,
  UpdateProjectParams,
  UpdateProposalBody,
  UpdateTaskBody,
} from "@workspace/api-zod";
import { Router, type IRouter } from "express";
import { generatePlan } from "../lib/ai-generate";
import { createFromBrief, detail, type StudioProject } from "../lib/studioflow-data";
import {
  archiveProject,
  getProject,
  getProjectByShareToken,
  listProjects,
  saveProject,
} from "../lib/studioflow-repository";

const router: IRouter = Router();

async function dashboard() {
  const projects = await listProjects();
  const allInvoices = projects.flatMap((item) => item.invoices);
  const revenue = allInvoices
    .filter((invoice) => invoice.status === "Paid")
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  const outstandingInvoices = allInvoices.filter(
    (invoice) => invoice.status !== "Paid",
  );
  const outstanding = outstandingInvoices.reduce(
    (sum, invoice) => sum + invoice.amount,
    0,
  );
  const activeProjects = projects.filter(
    (item) => item.status === "In progress",
  );

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const chartHistory = [4200, 6100, 5400, 7600, 6800];
  const nowMonth = new Date().getMonth();
  const chart = Array.from({ length: 6 }, (_, i) => ({
    month: months[(nowMonth - 5 + i + 12) % 12],
    value: i === 5 ? revenue : chartHistory[i],
  }));
  const previous = chart[chart.length - 2]?.value ?? 0;
  const revenueChange = previous
    ? Math.round(((revenue - previous) / previous) * 100)
    : 0;

  const daysUntil = (date: string) =>
    Math.max(
      0,
      Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000),
    );

  const upcoming = projects
    .filter((item) => item.status !== "Completed" && item.status !== "Archived")
    .map((item) => {
      const current = item.milestones.find(
        (milestone) => milestone.status === "current",
      );
      const date = current?.date ?? item.deadline;
      return {
        projectId: item.id,
        projectName: item.name,
        clientName: item.clientName,
        label: current?.name ?? "Project deadline",
        date,
        daysLeft: daysUntil(date),
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  return {
    revenue,
    revenueChange,
    activeProjects: activeProjects.length,
    outstanding,
    outstandingCount: outstandingInvoices.length,
    upcoming,
    activity: projects.flatMap((item) => item.activities).slice(0, 6),
    chart,
    projects: projects.map(summary),
  };
}

function summary(item: StudioProject) {
  const {
    goals: _goals,
    notes: _notes,
    proposal: _proposal,
    packages: _packages,
    milestones: _milestones,
    tasks: _tasks,
    invoices: _invoices,
    activities: _activities,
    ...rest
  } = item;
  return rest;
}

router.get("/dashboard", async (_req, res) => {
  res.json(GetDashboardResponse.parse(await dashboard()));
});

router.get("/projects", async (req, res) => {
  const parsed = GetProjectsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const search = parsed.data.search?.toLowerCase();
  const projects = await listProjects();
  const filtered = projects.filter(
    (item) =>
      (!search ||
        `${item.name} ${item.clientName}`.toLowerCase().includes(search)) &&
      (!parsed.data.status || item.status === parsed.data.status),
  );
  res.json(GetProjectsResponse.parse(filtered.map(summary)));
});

router.post("/projects", async (req, res) => {
  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const created = await createFromBrief(parsed.data);
  await saveProject(created);
  res.status(201).json(summary(created));
});

router.get("/projects/:id", async (req, res) => {
  const params = GetProjectParams.safeParse(req.params);
  const found = params.success ? await getProject(params.data.id) : undefined;
  if (!found) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.json(GetProjectResponse.parse(detail(found)));
});

router.patch("/projects/:id", async (req, res) => {
  const params = UpdateProjectParams.safeParse(req.params);
  const parsed = UpdateProjectBody.safeParse(req.body);
  const found = params.success ? await getProject(params.data.id) : undefined;
  if (!found || !parsed.success) {
    res.status(400).json({
      error: parsed.success ? "Project not found" : parsed.error.message,
    });
    return;
  }
  Object.assign(found, parsed.data);
  await saveProject(found);
  res.json(summary(found));
});

router.delete("/projects/:id", async (req, res) => {
  const found = await getProject(String(req.params.id));
  if (!found) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  found.status = "Archived";
  await archiveProject(found);
  res.status(204).send();
});

router.post("/projects/:id/generate", async (req, res) => {
  const found = await getProject(String(req.params.id));
  if (!found) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  const generated = await generatePlan({
    clientName: found.clientName,
    clientEmail: found.clientEmail,
    name: found.name,
    type: found.type,
    goals: found.goals,
    budget: found.budget,
    deadline: found.deadline,
    notes: found.notes,
  });
  if (generated) {
    found.proposal = { status: "Sent", ...generated.proposal };
    found.packages = generated.packages;
    found.milestones = generated.milestones;
    found.tasks = generated.tasks;
  }
  found.status = "Proposal sent";
  found.proposal.status = "Sent";
  found.progress = Math.max(found.progress, 8);
  await saveProject(found);
  res.json(GetProjectResponse.parse(found));
});

router.patch("/projects/:id/proposal", async (req, res) => {
  const parsed = UpdateProposalBody.safeParse(req.body);
  const found = await getProject(String(req.params.id));
  if (!found || !parsed.success) {
    res.status(400).json({
      error: parsed.success ? "Project not found" : parsed.error.message,
    });
    return;
  }
  Object.assign(found.proposal, parsed.data);
  await saveProject(found);
  res.json(found.proposal);
});

router.post("/projects/:id/tasks", async (req, res) => {
  const parsed = CreateTaskBody.safeParse(req.body);
  const found = await getProject(String(req.params.id));
  if (!found || !parsed.success) {
    res.status(400).json({
      error: parsed.success ? "Project not found" : parsed.error.message,
    });
    return;
  }
  const task = { id: `${found.id}-task-${Date.now()}`, ...parsed.data };
  found.tasks.unshift(task);
  await saveProject(found);
  res.status(201).json(task);
});

router.patch("/tasks/:id", async (req, res) => {
  const parsed = UpdateTaskBody.safeParse(req.body);
  const projects = await listProjects();
  const owner = projects.find((item) =>
    item.tasks.some((task) => task.id === String(req.params.id)),
  );
  const task = owner?.tasks.find((item) => item.id === String(req.params.id));
  if (!owner || !task || !parsed.success) {
    res.status(400).json({
      error: parsed.success ? "Task not found" : parsed.error.message,
    });
    return;
  }
  Object.assign(task, parsed.data);
  const completedTasks = owner.tasks.filter(
    (item) => item.status.toLowerCase() === "done",
  ).length;
  owner.progress = owner.tasks.length
    ? Math.round((completedTasks / owner.tasks.length) * 100)
    : 0;
  await saveProject(owner);
  res.json(task);
});

router.delete("/tasks/:id", async (req, res) => {
  const projects = await listProjects();
  const owner = projects.find((item) =>
    item.tasks.some((task) => task.id === String(req.params.id)),
  );
  if (!owner) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  owner.tasks = owner.tasks.filter((task) => task.id !== String(req.params.id));
  await saveProject(owner);
  res.status(204).send();
});

router.post("/projects/:id/invoices", async (req, res) => {
  const parsed = CreateInvoiceBody.safeParse(req.body);
  const found = await getProject(String(req.params.id));
  if (!found || !parsed.success) {
    res.status(400).json({
      error: parsed.success ? "Project not found" : parsed.error.message,
    });
    return;
  }
  const invoice = {
    id: `${found.id}-invoice-${Date.now()}`,
    ...parsed.data,
    number:
      parsed.data.number || `INV-${Math.floor(1000 + Math.random() * 9000)}`,
  };
  found.invoices.unshift(invoice);
  await saveProject(found);
  res.status(201).json(invoice);
});

router.patch("/invoices/:id", async (req, res) => {
  const parsed = UpdateInvoiceBody.safeParse(req.body);
  const projects = await listProjects();
  const owner = projects.find((item) =>
    item.invoices.some((invoice) => invoice.id === String(req.params.id)),
  );
  const invoice = owner?.invoices.find(
    (item) => item.id === String(req.params.id),
  );
  if (!owner || !invoice || !parsed.success) {
    res.status(400).json({
      error: parsed.success ? "Invoice not found" : parsed.error.message,
    });
    return;
  }
  Object.assign(invoice, parsed.data);
  await saveProject(owner);
  res.json(invoice);
});

router.delete("/invoices/:id", async (req, res) => {
  const projects = await listProjects();
  const owner = projects.find((item) =>
    item.invoices.some((invoice) => invoice.id === String(req.params.id)),
  );
  if (!owner) {
    res.status(404).json({ error: "Invoice not found" });
    return;
  }
  owner.invoices = owner.invoices.filter(
    (invoice) => invoice.id !== String(req.params.id),
  );
  await saveProject(owner);
  res.status(204).send();
});

router.post("/projects/:id/milestones", async (req, res) => {
  const parsed = CreateMilestoneBody.safeParse(req.body);
  const found = await getProject(String(req.params.id));
  if (!found || !parsed.success) {
    res.status(400).json({
      error: parsed.success ? "Project not found" : parsed.error.message,
    });
    return;
  }
  const milestone = {
    id: `${found.id}-milestone-${Date.now()}`,
    ...parsed.data,
  };
  found.milestones.push(milestone);
  await saveProject(found);
  res.status(201).json(milestone);
});

router.patch("/milestones/:id", async (req, res) => {
  const parsed = UpdateMilestoneBody.safeParse(req.body);
  const projects = await listProjects();
  const owner = projects.find((item) =>
    item.milestones.some((milestone) => milestone.id === String(req.params.id)),
  );
  const milestone = owner?.milestones.find(
    (item) => item.id === String(req.params.id),
  );
  if (!owner || !milestone || !parsed.success) {
    res.status(400).json({
      error: parsed.success ? "Milestone not found" : parsed.error.message,
    });
    return;
  }
  Object.assign(milestone, parsed.data);
  await saveProject(owner);
  res.json(milestone);
});

router.delete("/milestones/:id", async (req, res) => {
  const projects = await listProjects();
  const owner = projects.find((item) =>
    item.milestones.some((milestone) => milestone.id === String(req.params.id)),
  );
  if (!owner) {
    res.status(404).json({ error: "Milestone not found" });
    return;
  }
  owner.milestones = owner.milestones.filter(
    (milestone) => milestone.id !== String(req.params.id),
  );
  await saveProject(owner);
  res.status(204).send();
});

router.post("/projects/:id/proposal/approve", async (req, res) => {
  const parsed = ApproveProposalBody.safeParse(req.body);
  const found = await getProject(String(req.params.id));
  if (!found || !parsed.success) {
    res.status(400).json({
      error: parsed.success ? "Project not found" : parsed.error.message,
    });
    return;
  }
  found.proposal.status = "Approved";
  found.proposal.selectedPackage =
    parsed.data.packageId ?? found.proposal.selectedPackage;
  found.status = "In progress";
  await saveProject(found);
  res.json(found);
});

router.post("/projects/:id/proposal/changes", async (req, res) => {
  const parsed = RequestProposalChangesBody.safeParse(req.body);
  const found = await getProject(String(req.params.id));
  if (!found || !parsed.success) {
    res.status(400).json({
      error: parsed.success ? "Project not found" : parsed.error.message,
    });
    return;
  }
  found.proposal.status = "Changes requested";
  found.activities.unshift({
    id: `${found.id}-change-${Date.now()}`,
    actor: "Client",
    action: parsed.data.note
      ? `requested changes: ${parsed.data.note}`
      : "requested changes to the proposal",
    time: "Just now",
    type: "comment",
  });
  await saveProject(found);
  res.json(found);
});

router.get("/portal/:token", async (req, res) => {
  const params = GetClientPortalParams.safeParse(req.params);
  const found = params.success
    ? await getProjectByShareToken(params.data.token)
    : undefined;
  if (!found) {
    res.status(404).json({ error: "Portal not found" });
    return;
  }
  res.json(found);
});

export default router;