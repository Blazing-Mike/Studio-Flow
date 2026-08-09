import { Router, type IRouter } from "express";
import {
  ApproveProposalBody,
  CreateProjectBody,
  GetClientPortalParams,
  GetDashboardResponse,
  GetProjectParams,
  GetProjectResponse,
  GetProjectsQueryParams,
  GetProjectsResponse,
  RequestProposalChangesBody,
  UpdateInvoiceBody,
  UpdateProjectBody,
  UpdateProjectParams,
  UpdateTaskBody,
} from "@workspace/api-zod";
import {
  createFromBrief,
  detail,
  getProject,
  projects,
  type StudioProject,
} from "../lib/studioflow-data";

const router: IRouter = Router();

function dashboard() {
  const allInvoices = projects.flatMap((item) => item.invoices);
  const revenue = allInvoices.filter((invoice) => invoice.status === "Paid").reduce((sum, invoice) => sum + invoice.amount, 0);
  const outstanding = allInvoices.filter((invoice) => invoice.status !== "Paid").reduce((sum, invoice) => sum + invoice.amount, 0);
  return {
    revenue,
    revenueChange: 12.8,
    activeProjects: projects.filter((item) => item.status === "In progress").length,
    outstanding,
    upcoming: projects.slice(0, 4).map((item) => ({
      projectId: item.id,
      projectName: item.name,
      clientName: item.clientName,
      label: item.milestones.find((milestone) => milestone.status === "current")?.name ?? "Project deadline",
      date: item.milestones.find((milestone) => milestone.status === "current")?.date ?? item.deadline,
      daysLeft: 9,
    })),
    activity: projects.flatMap((item) => item.activities).slice(0, 6),
    chart: [
      { month: "Mar", value: 4200 },
      { month: "Apr", value: 6100 },
      { month: "May", value: 5400 },
      { month: "Jun", value: 7600 },
      { month: "Jul", value: 6800 },
      { month: "Aug", value: revenue },
    ],
    projects: projects.map(summary),
  };
}

function summary(item: StudioProject) {
  const { goals: _goals, notes: _notes, proposal: _proposal, packages: _packages, milestones: _milestones, tasks: _tasks, invoices: _invoices, activities: _activities, ...rest } = item;
  return rest;
}

router.get("/dashboard", (_req, res) => {
  res.json(GetDashboardResponse.parse(dashboard()));
});

router.get("/projects", (req, res) => {
  const parsed = GetProjectsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const search = parsed.data.search?.toLowerCase();
  const filtered = projects.filter((item) =>
    (!search || `${item.name} ${item.clientName}`.toLowerCase().includes(search)) &&
    (!parsed.data.status || item.status === parsed.data.status),
  );
  res.json(GetProjectsResponse.parse(filtered.map(summary)));
});

router.post("/projects", (req, res) => {
  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  res.status(201).json(summary(createFromBrief(parsed.data)));
});

router.get("/projects/:id", (req, res) => {
  const params = GetProjectParams.safeParse(req.params);
  const found = params.success ? getProject(params.data.id) : undefined;
  if (!found) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.json(GetProjectResponse.parse(detail(found)));
});

router.patch("/projects/:id", (req, res) => {
  const params = UpdateProjectParams.safeParse(req.params);
  const parsed = UpdateProjectBody.safeParse(req.body);
  const found = params.success ? getProject(params.data.id) : undefined;
  if (!found || !parsed.success) {
    res.status(400).json({ error: parsed.success ? "Project not found" : parsed.error.message });
    return;
  }
  Object.assign(found, parsed.data);
  res.json(summary(found));
});

router.delete("/projects/:id", (req, res) => {
  const found = getProject(String(req.params.id));
  if (!found) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  found.status = "Archived";
  res.status(204).send();
});

router.post("/projects/:id/generate", (req, res) => {
  const found = getProject(String(req.params.id));
  if (!found) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  found.status = "Proposal sent";
  found.proposal.status = "Sent";
  found.progress = Math.max(found.progress, 8);
  res.json(GetProjectResponse.parse(found));
});

router.patch("/tasks/:id", (req, res) => {
  const parsed = UpdateTaskBody.safeParse(req.body);
  const owner = projects.find((item) => item.tasks.some((task) => task.id === String(req.params.id)));
  const task = owner?.tasks.find((item) => item.id === String(req.params.id));
  if (!owner || !task || !parsed.success) {
    res.status(400).json({ error: parsed.success ? "Task not found" : parsed.error.message });
    return;
  }
  Object.assign(task, parsed.data);
  const completedTasks = owner.tasks.filter((item) => item.status.toLowerCase() === "done").length;
  owner.progress = owner.tasks.length ? Math.round((completedTasks / owner.tasks.length) * 100) : 0;
  res.json(task);
});

router.patch("/invoices/:id", (req, res) => {
  const parsed = UpdateInvoiceBody.safeParse(req.body);
  const invoice = projects.flatMap((item) => item.invoices).find((item) => item.id === String(req.params.id));
  if (!invoice || !parsed.success) {
    res.status(400).json({ error: parsed.success ? "Invoice not found" : parsed.error.message });
    return;
  }
  Object.assign(invoice, parsed.data);
  res.json(invoice);
});

router.post("/projects/:id/proposal/approve", (req, res) => {
  const parsed = ApproveProposalBody.safeParse(req.body);
  const found = getProject(String(req.params.id));
  if (!found || !parsed.success) {
    res.status(400).json({ error: parsed.success ? "Project not found" : parsed.error.message });
    return;
  }
  found.proposal.status = "Approved";
  found.proposal.selectedPackage = parsed.data.packageId ?? found.proposal.selectedPackage;
  found.status = "In progress";
  res.json(found);
});

router.post("/projects/:id/proposal/changes", (req, res) => {
  const parsed = RequestProposalChangesBody.safeParse(req.body);
  const found = getProject(String(req.params.id));
  if (!found || !parsed.success) {
    res.status(400).json({ error: parsed.success ? "Project not found" : parsed.error.message });
    return;
  }
  found.proposal.status = "Changes requested";
  found.activities.unshift({
    id: `${found.id}-change-${Date.now()}`,
    actor: "Client",
    action: parsed.data.note ? `requested changes: ${parsed.data.note}` : "requested changes to the proposal",
    time: "Just now",
    type: "comment",
  });
  res.json(found);
});

router.get("/portal/:token", (req, res) => {
  const params = GetClientPortalParams.safeParse(req.params);
  const found = params.success ? projects.find((item) => item.shareToken === params.data.token) : undefined;
  if (!found) {
    res.status(404).json({ error: "Portal not found" });
    return;
  }
  res.json(found);
});

export default router;