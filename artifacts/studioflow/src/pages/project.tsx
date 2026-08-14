import { AppShell } from "@/components/app-shell";
import { ActivityList, PackageCard, Skeleton, StatusPill } from "@/components/shared";
import { usePageTitle } from "@/hooks/use-page-title";
import { useStreamPlan } from "@/hooks/use-stream-plan";
import {
  getGetProjectQueryKey,
  useCreateInvoice,
  useCreateMilestone,
  useCreateTask,
  useDeleteInvoice,
  useDeleteMilestone,
  useDeleteTask,
  useGetProject,
  useUpdateInvoice,
  useUpdateMilestone,
  useUpdateProject,
  useUpdateProposal,
  useUpdateTask,
} from "@workspace/api-client-react";
import type {
  Invoice,
  InvoiceInput,
  Milestone,
  MilestoneInput,
  ProjectDetail,
  ProjectUpdate,
  ProposalUpdate,
  Task,
  TaskInput,
} from "@workspace/api-client-react";
import { cx, date, money } from "@/lib/format";
import { queryClient } from "@/lib/query-client";
import { sampleDetail, sampleProjects } from "@/lib/sample-data";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Check,
  CircleDollarSign,
  Clock3,
  Copy,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  ReceiptText,
  Send,
  Sparkles,
  Target,
  Trash2,
} from "lucide-react";
import { Link, useParams } from "wouter";
import { useState } from "react";

export function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const query = useGetProject(id ?? "", {
    query: { enabled: !!id, queryKey: getGetProjectQueryKey(id ?? "") },
  });
  const fallback = sampleProjects.find((p) => p.id === id) ?? sampleProjects[0];
  const project = query.data ?? sampleDetail(fallback);
  const [tab, setTab] = useState("Overview");
  const { label, run, isStreaming } = useStreamPlan(id);
  usePageTitle(project.name);
  const [portalCopied, setPortalCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const tabs = [
    "Overview",
    "Proposal",
    "Timeline",
    "Tasks",
    "Invoices",
    "Client activity",
  ];
  const refresh = () =>
    queryClient.invalidateQueries({
      queryKey: getGetProjectQueryKey(id ?? ""),
    });
  const sharePortal = () => {
    navigator.clipboard?.writeText(
      `${window.location.origin}/portal/${project.shareToken ?? id}`,
    );
    setPortalCopied(true);
    window.setTimeout(() => setPortalCopied(false), 1600);
  };
  return (
    <AppShell>
      <div className="workspace-head reveal">
        <div className="workspace-heading">
          <Link
            href="/projects"
            className="back-link"
            data-testid="link-workspace-back"
          >
            <ArrowLeft size={16} /> Projects
          </Link>
          <div className="project-title-row">
            <div
              className="project-big-avatar"
              style={{
                background: `${project.accent}22`,
                color: project.accent,
              }}
            >
              {project.initials}
            </div>
            <div>
              <div className="eyebrow">
                {project.type} <span className="dot-separator">·</span>{" "}
                {project.clientName}
              </div>
              <h1>{project.name}</h1>
            </div>
            <StatusPill status={project.status} />
          </div>
        </div>
        <div className="workspace-actions">
          <button
            data-testid="button-edit-project"
            className="button outline"
            onClick={() => setEditing((e) => !e)}
          >
            <Pencil size={14} /> {editing ? "Done editing" : "Edit details"}
          </button>
          <button
            data-testid="button-share-project"
            className="button outline share-portal-button"
            onClick={sharePortal}
          >
            {portalCopied ? <Check size={15} /> : <Send size={15} />}{" "}
            {portalCopied ? "Copied" : "Share portal"}
          </button>
          <button
            data-testid="button-workspace-more"
            className="icon-button"
            aria-label="More actions"
          >
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>
      {editing ? (
        <ProjectEditForm
          project={project}
          onDone={() => {
            setEditing(false);
            refresh();
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <>
          <div className="workspace-meta reveal delay-1">
            <span>
              <CalendarDays size={15} /> Due {date(project.deadline)}
            </span>
            <span>
              <CircleDollarSign size={15} /> {money(project.budget)} project
              value
            </span>
            <div className="workspace-progress">
              <span>{project.progress}% complete</span>
              <div className="progress-track">
                <i
                  style={{
                    width: `${project.progress}%`,
                    background: project.accent,
                  }}
                />
              </div>
            </div>
          </div>
          <div className="tabs reveal delay-1">
            {tabs.map((item) => (
              <button
                data-testid={`tab-${item.toLowerCase().replaceAll(" ", "-")}`}
                key={item}
                className={cx(tab === item && "active")}
                onClick={() => setTab(item)}
              >
                {item}
                {item === "Tasks" && <em>{project.tasks.length}</em>}
              </button>
            ))}
          </div>
          <div className="workspace-content reveal delay-2">
            {query.isLoading ? (
              <div className="workspace-loading">
                <Skeleton className="h-52" />
                <Skeleton className="h-52" />
              </div>
            ) : tab === "Overview" ? (
              <OverviewTab
                project={project}
                onGenerate={run}
                generating={isStreaming}
                generatingLabel={label}
              />
            ) : tab === "Proposal" ? (
              <ProposalTab project={project} />
            ) : tab === "Timeline" ? (
              <TimelineTab project={project} />
            ) : tab === "Tasks" ? (
              <TasksTab project={project} />
            ) : tab === "Invoices" ? (
              <InvoicesTab project={project} />
            ) : (
              <ActivityList activities={project.activities} />
            )}
          </div>
        </>
      )}
    </AppShell>
  );
}

function ProjectEditForm({
  project,
  onDone,
  onCancel,
}: {
  project: ProjectDetail;
  onDone: () => void;
  onCancel: () => void;
}) {
  const update = useUpdateProject();
  const [form, setForm] = useState<ProjectUpdate>({ ...project });
  const updateField = (key: keyof ProjectUpdate, value: string | number) =>
    setForm((f) => ({ ...f, [key]: value }));
  const save = () =>
    update.mutate(
      { id: project.id, data: { ...form, budget: Number(form.budget) || 0 } },
      { onSuccess: onDone },
    );
  return (
    <div className="brief-form reveal delay-1" data-testid="project-edit-form">
      <div className="form-section">
        <div className="form-section-title">
          <span>01</span>
          <div>
            <h2>Project details</h2>
            <p>Shape how this engagement shows up.</p>
          </div>
        </div>
        <div className="form-grid">
          <label>
            Project name
            <input
              data-testid="input-edit-project-name"
              value={form.name ?? ""}
              onChange={(e) => updateField("name", e.target.value)}
            />
          </label>
          <label className="span-2">
            Status
            <select
              value={form.status ?? ""}
              onChange={(e) => updateField("status", e.target.value)}
            >
              <option>Draft</option>
              <option>Proposal sent</option>
              <option>In progress</option>
              <option>Completed</option>
              <option>Archived</option>
            </select>
          </label>
          <label>
            Client name
            <input
              value={form.clientName ?? ""}
              onChange={(e) => updateField("clientName", e.target.value)}
            />
          </label>
          <label>
            Client email
            <input
              type="email"
              value={form.clientEmail ?? ""}
              onChange={(e) => updateField("clientEmail", e.target.value)}
            />
          </label>
          <label>
            Project type
            <select
              value={form.type ?? ""}
              onChange={(e) => updateField("type", e.target.value)}
            >
              <option>Brand identity</option>
              <option>Web design</option>
              <option>Creative direction</option>
              <option>Packaging</option>
              <option>Content system</option>
            </select>
          </label>
          <label>
            Estimated budget
            <input
              type="number"
              value={form.budget ?? ""}
              onChange={(e) => updateField("budget", Number(e.target.value))}
            />
          </label>
          <label>
            Target deadline
            <input
              type="date"
              value={form.deadline ?? ""}
              onChange={(e) => updateField("deadline", e.target.value)}
            />
          </label>
        </div>
      </div>
      <div className="form-section">
        <div className="form-section-title">
          <span>02</span>
          <div>
            <h2>The brief</h2>
            <p>Context the proposal and plan draw from.</p>
          </div>
        </div>
        <label>
          Goals
          <textarea
            rows={3}
            value={form.goals ?? ""}
            onChange={(e) => updateField("goals", e.target.value)}
          />
        </label>
        <label>
          Notes
          <textarea
            rows={3}
            value={form.notes ?? ""}
            onChange={(e) => updateField("notes", e.target.value)}
          />
        </label>
      </div>
      <div className="form-submit">
        <div>
          <span>
            <strong>Changes save to this project</strong>
            <small>
              Reflected on the dashboard, proposal, and client portal.
            </small>
          </span>
        </div>
        <div className="editor-actions">
          <button className="button outline" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="button primary"
            data-testid="button-save-project"
            disabled={update.isPending}
            onClick={save}
          >
            {update.isPending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function OverviewTab({
  project,
  onGenerate,
  generating,
  generatingLabel,
}: {
  project: ProjectDetail;
  onGenerate: () => void;
  generating: boolean;
  generatingLabel?: string | null;
}) {
  return (
    <div className="overview-layout">
      <div className="overview-main">
        <section className="panel intro-panel">
          <div className="intro-top">
            <div>
              <p className="eyebrow">The brief</p>
              <h2>{project.goals}</h2>
            </div>
            <Target size={25} />
          </div>
          <p className="body-copy">{project.notes}</p>
        </section>
        <section className="panel next-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Keep it moving</p>
              <h2>Next up</h2>
            </div>
            <span className="next-count">
              {
                project.tasks.filter((t) => t.status.toLowerCase() !== "done")
                  .length
              }{" "}
              open
            </span>
          </div>
          {project.tasks
            .filter((t) => t.status.toLowerCase() !== "done")
            .slice(0, 3)
            .map((task) => (
              <div className="next-task" key={task.id}>
                <div className="task-check" />
                <div>
                  <strong>{task.title}</strong>
                  <span>
                    {task.phase} · due {date(task.dueDate)}
                  </span>
                </div>
                <ArrowUpRight size={15} />
              </div>
            ))}
        </section>
      </div>
      <div className="overview-side">
        <section className="panel plan-card">
          <div className="plan-glow" />
          <Sparkles size={21} />
          <h3>Make the busywork disappear.</h3>
          <p>
            Generate a polished proposal, packages, milestones, and tasks from
            the brief.
          </p>
          <button
            data-testid="button-generate-plan"
            className="button dark"
            onClick={onGenerate}
            disabled={generating}
          >
            {generating ? (
              <>
                <Loader2 size={16} className="spin" />{" "}
                {generatingLabel ?? "Thinking through it…"}
              </>
            ) : (
              <>
                <Sparkles size={16} /> Generate project plan
              </>
            )}
          </button>
          {generating && (
            <p className="generate-note">
              <Loader2 size={12} className="spin" />{" "}
              {generatingLabel ??
                "Drafting your proposal, packages, and timeline…"}
            </p>
          )}
        </section>
        <section className="panel mini-activity">
          <div className="panel-head">
            <h2>Recent activity</h2>
            <Clock3 size={16} />
          </div>
          <ActivityList activities={project.activities.slice(0, 3)} />
        </section>
      </div>
    </div>
  );
}

function ProposalTab({ project }: { project: ProjectDetail }) {
  const update = useUpdateProposal();
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState<ProposalUpdate>({ ...project.proposal });
  const refresh = () =>
    queryClient.invalidateQueries({
      queryKey: getGetProjectQueryKey(project.id),
    });
  const save = () =>
    update.mutate(
      { id: project.id, data: form },
      {
        onSuccess: () => {
          setEditing(false);
          refresh();
        },
      },
    );
  const copy = () => {
    navigator.clipboard?.writeText(
      `${window.location.origin}/portal/${project.shareToken ?? project.id}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  return (
    <div className="proposal-layout">
      <section className="proposal-copy panel">
        <div className="proposal-status">
          <StatusPill status={project.proposal.status} />
          <button
            className="button outline"
            onClick={() => {
              setForm({ ...project.proposal });
              setEditing(!editing);
            }}
          >
            <Pencil size={14} /> {editing ? "Cancel" : "Edit proposal"}
          </button>
        </div>
        {editing ? (
          <div className="editor-form">
            <label>
              Headline
              <input
                value={form.headline ?? ""}
                onChange={(e) =>
                  setForm((value) => ({ ...value, headline: e.target.value }))
                }
              />
            </label>
            <label>
              Proposal text
              <textarea
                rows={7}
                value={form.body ?? ""}
                onChange={(e) =>
                  setForm((value) => ({ ...value, body: e.target.value }))
                }
              />
            </label>
            <label>
              Proposal status
              <select
                value={form.status ?? "Draft"}
                onChange={(e) =>
                  setForm((value) => ({ ...value, status: e.target.value }))
                }
              >
                <option>Draft</option>
                <option>Sent</option>
                <option>Approved</option>
              </select>
            </label>
            <button
              className="button primary"
              disabled={update.isPending}
              onClick={save}
            >
              {update.isPending ? "Saving…" : "Save proposal"}
            </button>
          </div>
        ) : (
          <>
            <p className="eyebrow">Proposal headline</p>
            <h2>{project.proposal.headline}</h2>
            <p className="proposal-body">{project.proposal.body}</p>
          </>
        )}
        <div className="proposal-rule" />
        <p className="eyebrow">Client-facing portal</p>
        <div className="share-box">
          <div>
            <strong>Ready to share</strong>
            <span>Clients can choose a package and approve online.</span>
          </div>
          <button
            data-testid="button-copy-portal-link"
            className="button outline"
            onClick={copy}
          >
            {copied ? (
              <>
                <Check size={15} /> Copied
              </>
            ) : (
              <>
                <Copy size={15} /> Copy link
              </>
            )}
          </button>
        </div>
      </section>
      <section className="packages">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Your recommendation</p>
            <h2>Package options</h2>
          </div>
          <span className="muted-note">Choose the portal default</span>
        </div>
        {project.packages.map((pkg) => (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            selected={
              (editing
                ? form.selectedPackage
                : project.proposal.selectedPackage) === pkg.id
            }
            onSelect={() =>
              editing
                ? setForm((value) => ({ ...value, selectedPackage: pkg.id }))
                : setEditing(true)
            }
          />
        ))}
        {editing && (
          <button
            className="button primary"
            disabled={update.isPending}
            onClick={save}
          >
            Save package default
          </button>
        )}
      </section>
    </div>
  );
}
function TimelineTab({ project }: { project: ProjectDetail }) {
  const create = useCreateMilestone();
  const update = useUpdateMilestone();
  const remove = useDeleteMilestone();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [filter, setFilter] = useState("All milestones");
  const [form, setForm] = useState<MilestoneInput>({
    name: "",
    date: project.deadline,
    status: "upcoming",
  });
  const refresh = () =>
    queryClient.invalidateQueries({
      queryKey: getGetProjectQueryKey(project.id),
    });
  const save = () => {
    if (!form.name.trim()) return;
    const done = () => {
      setAdding(false);
      setEditing(null);
      setForm({ name: "", date: project.deadline, status: "upcoming" });
      refresh();
    };
    if (editing)
      update.mutate({ id: editing, data: form }, { onSuccess: done });
    else create.mutate({ id: project.id, data: form }, { onSuccess: done });
  };
  const startEdit = (milestone: Milestone) => {
    setEditing(milestone.id);
    setAdding(true);
    setForm({
      name: milestone.name,
      date: milestone.date,
      status: milestone.status,
    });
  };
  const label = (status: string) =>
    status === "current"
      ? "In the studio now"
      : status === "complete"
        ? "Complete"
        : "Coming up";
  const visible = project.milestones.filter(
    (m) => filter === "All milestones" || label(m.status) === filter,
  );
  return (
    <section className="panel timeline-panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">A clear path forward</p>
          <h2>Project timeline</h2>
        </div>
        <div className="timeline-actions">
          <select
            data-testid="select-timeline-filter"
            className="inline-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option>All milestones</option>
            <option>Coming up</option>
            <option>In the studio now</option>
            <option>Complete</option>
          </select>
          <button
            data-testid="button-add-milestone"
            className="button outline"
            onClick={() => {
              setEditing(null);
              setAdding(true);
            }}
          >
            <Plus size={15} /> Add milestone
          </button>
        </div>
      </div>
      {adding && (
        <div className="editor-form compact">
          <label>
            Milestone name
            <input
              autoFocus
              value={form.name}
              onChange={(e) =>
                setForm((value) => ({ ...value, name: e.target.value }))
              }
            />
          </label>
          <label>
            Date
            <input
              type="date"
              value={form.date}
              onChange={(e) =>
                setForm((value) => ({ ...value, date: e.target.value }))
              }
            />
          </label>
          <label>
            Status
            <select
              value={form.status}
              onChange={(e) =>
                setForm((value) => ({ ...value, status: e.target.value }))
              }
            >
              <option value="upcoming">Coming up</option>
              <option value="current">In the studio now</option>
              <option value="complete">Complete</option>
            </select>
          </label>
          <div className="editor-actions">
            <button className="button outline" onClick={() => setAdding(false)}>
              Cancel
            </button>
            <button
              className="button primary"
              disabled={create.isPending || update.isPending}
              onClick={save}
            >
              {editing ? "Save milestone" : "Add milestone"}
            </button>
          </div>
        </div>
      )}
      <div className="timeline">
        {visible.map((milestone, i) => (
          <div className={cx("milestone", milestone.status)} key={milestone.id}>
            <div className="milestone-line">
              <div className="milestone-dot">
                {milestone.status === "complete" ? <Check size={13} /> : i + 1}
              </div>
              {i < visible.length - 1 && <div className="line" />}
            </div>
            <div className="milestone-copy">
              <span>{label(milestone.status)}</span>
              <h3>{milestone.name}</h3>
              <p>{date(milestone.date)}</p>
              <div className="milestone-actions">
                <button
                  className="icon-button tiny"
                  title="Edit milestone"
                  aria-label="Edit milestone"
                  onClick={() => startEdit(milestone)}
                >
                  <Pencil size={14} />
                </button>
                <button
                  className="icon-button tiny"
                  title="Delete milestone"
                  aria-label="Delete milestone"
                  onClick={() =>
                    remove.mutate({ id: milestone.id }, { onSuccess: refresh })
                  }
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
function TasksTab({ project }: { project: ProjectDetail }) {
  const create = useCreateTask();
  const update = useUpdateTask();
  const remove = useDeleteTask();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<TaskInput>({
    title: "",
    phase: "Planning",
    status: "To Do",
    dueDate: project.deadline,
    assignee: "You",
  });
  const refresh = () =>
    queryClient.invalidateQueries({
      queryKey: getGetProjectQueryKey(project.id),
    });
  const save = () => {
    if (!form.title.trim()) return;
    const done = () => {
      setAdding(false);
      setEditing(null);
      setForm({
        title: "",
        phase: "Planning",
        status: "To Do",
        dueDate: project.deadline,
        assignee: "You",
      });
      refresh();
    };
    if (editing)
      update.mutate({ id: editing, data: form }, { onSuccess: done });
    else create.mutate({ id: project.id, data: form }, { onSuccess: done });
  };
  const startEdit = (task: Task) => {
    setEditing(task.id);
    setAdding(true);
    setForm({
      title: task.title,
      phase: task.phase,
      status: task.status,
      dueDate: task.dueDate,
      assignee: task.assignee ?? "You",
    });
  };
  return (
    <section className="panel tasks-panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Small steps, big picture</p>
          <h2>Tasks</h2>
        </div>
        <button
          data-testid="button-add-task"
          className="button outline"
          onClick={() => {
            setEditing(null);
            setAdding(true);
          }}
        >
          <Plus size={15} /> Add task
        </button>
      </div>
      {adding && (
        <div className="editor-form compact">
          <label>
            Task title
            <input
              autoFocus
              value={form.title}
              onChange={(e) =>
                setForm((value) => ({ ...value, title: e.target.value }))
              }
            />
          </label>
          <label>
            Phase
            <input
              value={form.phase}
              onChange={(e) =>
                setForm((value) => ({ ...value, phase: e.target.value }))
              }
            />
          </label>
          <label>
            Status
            <select
              value={form.status}
              onChange={(e) =>
                setForm((value) => ({ ...value, status: e.target.value }))
              }
            >
              <option>To Do</option>
              <option>In Progress</option>
              <option>Review</option>
              <option>Done</option>
            </select>
          </label>
          <label>
            Due date
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) =>
                setForm((value) => ({ ...value, dueDate: e.target.value }))
              }
            />
          </label>
          <label>
            Assignee
            <input
              value={form.assignee}
              onChange={(e) =>
                setForm((value) => ({ ...value, assignee: e.target.value }))
              }
            />
          </label>
          <div className="editor-actions">
            <button className="button outline" onClick={() => setAdding(false)}>
              Cancel
            </button>
            <button
              className="button primary"
              disabled={create.isPending || update.isPending}
              onClick={save}
            >
              {editing ? "Save task" : "Create task"}
            </button>
          </div>
        </div>
      )}
      <div className="task-table">
        {project.tasks.map((task) => {
          const isDone = task.status.toLowerCase() === "done";
          return (
            <div className="task-row" key={task.id}>
              <button
                data-testid={`button-task-${task.id}`}
                className={cx("task-check", isDone && "done")}
                onClick={() =>
                  update.mutate(
                    {
                      id: task.id,
                      data: { status: isDone ? "To Do" : "Done" },
                    },
                    { onSuccess: refresh },
                  )
                }
              >
                {isDone && <Check size={13} />}
              </button>
              <div className={cx("task-title", isDone && "completed")}>
                <strong>{task.title}</strong>
                <span>{task.phase}</span>
              </div>
              <span className="task-assignee">{task.assignee}</span>
              <span className="task-due">{date(task.dueDate)}</span>
              <select
                className="inline-select"
                aria-label={`Status for ${task.title}`}
                value={task.status}
                onChange={(e) =>
                  update.mutate(
                    { id: task.id, data: { status: e.target.value } },
                    { onSuccess: refresh },
                  )
                }
              >
                <option>To Do</option>
                <option>In Progress</option>
                <option>Review</option>
                <option>Done</option>
              </select>
              <button
                className="icon-button tiny"
                title="Edit task"
                aria-label="Edit task"
                onClick={() => startEdit(task)}
              >
                <Pencil size={14} />
              </button>
              <button
                className="icon-button tiny"
                title="Delete task"
                aria-label="Delete task"
                onClick={() =>
                  remove.mutate({ id: task.id }, { onSuccess: refresh })
                }
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
function InvoicesTab({ project }: { project: ProjectDetail }) {
  const create = useCreateInvoice();
  const update = useUpdateInvoice();
  const remove = useDeleteInvoice();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<InvoiceInput>({
    description: "",
    amount: 0,
    dueDate: project.deadline,
    status: "Draft",
  });
  const refresh = () =>
    queryClient.invalidateQueries({
      queryKey: getGetProjectQueryKey(project.id),
    });
  const save = () => {
    if (!form.description.trim() || form.amount <= 0) return;
    const done = () => {
      setAdding(false);
      setEditing(null);
      setForm({
        description: "",
        amount: 0,
        dueDate: project.deadline,
        status: "Draft",
      });
      refresh();
    };
    if (editing)
      update.mutate({ id: editing, data: form }, { onSuccess: done });
    else create.mutate({ id: project.id, data: form }, { onSuccess: done });
  };
  const startEdit = (invoice: Invoice) => {
    setEditing(invoice.id);
    setAdding(true);
    setForm({
      number: invoice.number,
      description: invoice.description,
      amount: invoice.amount,
      dueDate: invoice.dueDate,
      status: invoice.status,
    });
  };
  const paid = project.invoices
    .filter((i) => i.status.toLowerCase() === "paid")
    .reduce((sum, i) => sum + i.amount, 0);
  return (
    <section className="panel invoices-panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Money, without the awkwardness</p>
          <h2>Invoices</h2>
        </div>
        <button
          data-testid="button-new-invoice"
          className="button outline"
          onClick={() => {
            setEditing(null);
            setAdding(true);
          }}
        >
          <Plus size={15} /> New invoice
        </button>
      </div>
      <div className="invoice-summary">
        <div>
          <span>Invoiced</span>
          <strong>
            {money(project.invoices.reduce((sum, i) => sum + i.amount, 0))}
          </strong>
        </div>
        <div>
          <span>Paid</span>
          <strong>{money(paid)}</strong>
        </div>
        <div>
          <span>Remaining</span>
          <strong>
            {money(
              project.invoices.reduce((sum, i) => sum + i.amount, 0) - paid,
            )}
          </strong>
        </div>
      </div>
      {adding && (
        <div className="editor-form compact">
          <label>
            Description
            <input
              autoFocus
              value={form.description}
              onChange={(e) =>
                setForm((value) => ({ ...value, description: e.target.value }))
              }
            />
          </label>
          <label>
            Amount
            <input
              type="number"
              min="1"
              value={form.amount || ""}
              onChange={(e) =>
                setForm((value) => ({
                  ...value,
                  amount: Number(e.target.value),
                }))
              }
            />
          </label>
          <label>
            Due date
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) =>
                setForm((value) => ({ ...value, dueDate: e.target.value }))
              }
            />
          </label>
          <label>
            Status
            <select
              value={form.status}
              onChange={(e) =>
                setForm((value) => ({ ...value, status: e.target.value }))
              }
            >
              <option>Draft</option>
              <option>Sent</option>
              <option>Outstanding</option>
              <option>Paid</option>
            </select>
          </label>
          <label>
            Invoice number <span className="optional">Optional</span>
            <input
              value={form.number ?? ""}
              onChange={(e) =>
                setForm((value) => ({
                  ...value,
                  number: e.target.value || undefined,
                }))
              }
            />
          </label>
          <div className="editor-actions">
            <button className="button outline" onClick={() => setAdding(false)}>
              Cancel
            </button>
            <button
              className="button primary"
              disabled={create.isPending || update.isPending}
              onClick={save}
            >
              {editing ? "Save invoice" : "Create invoice"}
            </button>
          </div>
        </div>
      )}
      <div className="invoice-table">
        {project.invoices.map((invoice) => (
          <div className="invoice-row" key={invoice.id}>
            <div className="invoice-icon">
              <ReceiptText size={17} />
            </div>
            <div>
              <strong>{invoice.number}</strong>
              <span>{invoice.description}</span>
            </div>
            <strong className="invoice-amount">{money(invoice.amount)}</strong>
            <span className="task-due">Due {date(invoice.dueDate)}</span>
            <select
              className="inline-select"
              aria-label={`Status for ${invoice.number}`}
              value={invoice.status}
              onChange={(e) =>
                update.mutate(
                  { id: invoice.id, data: { status: e.target.value } },
                  { onSuccess: refresh },
                )
              }
            >
              <option>Draft</option>
              <option>Sent</option>
              <option>Outstanding</option>
              <option>Paid</option>
            </select>
            <button
              className="icon-button tiny"
              title="Edit invoice"
              aria-label="Edit invoice"
              onClick={() => startEdit(invoice)}
            >
              <Pencil size={14} />
            </button>
            <button
              className="icon-button tiny"
              title="Delete invoice"
              aria-label="Delete invoice"
              onClick={() =>
                remove.mutate({ id: invoice.id }, { onSuccess: refresh })
              }
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

