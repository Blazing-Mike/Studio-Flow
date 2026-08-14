import { AppShell } from "@/components/app-shell";
import { ProjectRow, Skeleton } from "@/components/shared";
import {
  getGetProjectsQueryKey,
  useArchiveProject,
  useCreateProject,
  useGetProjects,
} from "@workspace/api-client-react";
import {
  Archive,
  ArrowLeft,
  FolderOpen,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";
import { usePageTitle } from "@/hooks/use-page-title";
import { queryClient } from "@/lib/query-client";
import { sampleProjects } from "@/lib/sample-data";
import type { FormEvent, MouseEvent } from "react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

export function ProjectsPage() {
  usePageTitle("Projects");
  const query = useGetProjects();
  const archive = useArchiveProject();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All projects");
  const [sort, setSort] = useState("recent");
  const data = query.data ?? sampleProjects;
  const visible = data
    .filter((p) =>
      `${p.name} ${p.clientName}`.toLowerCase().includes(search.toLowerCase()),
    )
    .filter((p) => filter === "All projects" || p.status === filter);
  const sorted = [...visible].sort((a, b) => {
    if (sort === "deadline")
      return (a.deadline ?? "").localeCompare(b.deadline ?? "");
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "progress") return (b.progress ?? 0) - (a.progress ?? 0);
    if (sort === "budget") return (b.budget ?? 0) - (a.budget ?? 0);
    return 0; // "recently updated" = natural order
  });
  const doArchive = (e: MouseEvent, id: string) => {
    e.preventDefault();
    if (window.confirm("Archive this project?"))
      archive.mutate(
        { id },
        {
          onSuccess: () =>
            queryClient.invalidateQueries({
              queryKey: getGetProjectsQueryKey(),
            }),
        },
      );
  };
  return (
    <AppShell>
      <div className="page-head reveal">
        <div>
          <p className="eyebrow">Your work, in one place</p>
          <h1>Projects</h1>
          <p className="lede">Keep every engagement moving with less admin.</p>
        </div>
        <Link
          href="/projects/new"
          data-testid="link-projects-new"
          className="button primary"
        >
          <Plus size={17} /> New project
        </Link>
      </div>
      <div className="toolbar reveal delay-1">
        <div className="search-wrap">
          <Search size={17} />
          <input
            data-testid="input-project-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects or clients"
          />
        </div>
        <select
          data-testid="select-project-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option>All projects</option>
          <option>In progress</option>
          <option>Proposal sent</option>
          <option>Completed</option>
        </select>
        <select
          data-testid="select-project-sort"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="recent">Recently updated</option>
          <option value="deadline">Deadline</option>
          <option value="name">Name</option>
          <option value="progress">Progress</option>
          <option value="budget">Budget</option>
        </select>
      </div>
      <div className="project-list reveal delay-2">
        {query.isLoading ? (
          [1, 2, 3].map((i) => <Skeleton className="h-24" key={i} />)
        ) : sorted.length ? (
          sorted.map((project) => (
            <div className="project-list-card" key={project.id}>
              <ProjectRow project={project} />
              <button
                data-testid={`button-archive-${project.id}`}
                className="archive-button"
                title="Archive project"
                onClick={(e) => doArchive(e, project.id)}
              >
                <Archive size={15} />
              </button>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <FolderOpen size={30} />
            <h3>No projects match that search</h3>
            <p>Try another phrase or start a fresh engagement.</p>
            <Link href="/projects/new" className="button outline">
              Create a project
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export function NewProjectPage() {
  usePageTitle("New project");
  const [, setLocation] = useLocation();
  const create = useCreateProject();
  const [form, setForm] = useState({
    clientName: "",
    clientEmail: "",
    name: "",
    type: "Brand identity",
    goals: "",
    budget: "",
    deadline: "",
    notes: "",
  });
  const [generating, setGenerating] = useState(false);
  const update = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    create.mutate(
      { data: { ...form, budget: Number(form.budget) || 0 } },
      {
        onSuccess: (project) => setLocation(`/projects/${project.id}`),
        onError: () => setTimeout(() => setGenerating(false), 900),
      },
    );
  };
  return (
    <AppShell>
      <div className="narrow-page">
        <Link
          href="/projects"
          data-testid="link-back-projects"
          className="back-link"
        >
          <ArrowLeft size={16} /> All projects
        </Link>
        <div className="page-head compact reveal">
          <div>
            <p className="eyebrow">A new beginning</p>
            <h1>Start a project</h1>
            <p className="lede">
              Give StudioFlow the context. It’ll shape the first draft.
            </p>
          </div>
          <div className="ai-stamp">
            <Sparkles size={15} /> AI-assisted
          </div>
        </div>
        <form className="brief-form reveal delay-1" onSubmit={submit}>
          <div className="form-section">
            <div className="form-section-title">
              <span>01</span>
              <div>
                <h2>The basics</h2>
                <p>Who are you making this with?</p>
              </div>
            </div>
            <div className="form-grid">
              <label>
                Client name
                <input
                  data-testid="input-client-name"
                  required
                  value={form.clientName}
                  onChange={(e) => update("clientName", e.target.value)}
                  placeholder="e.g. Maya Chen"
                />
              </label>
              <label>
                Client email
                <input
                  data-testid="input-client-email"
                  type="email"
                  required
                  value={form.clientEmail}
                  onChange={(e) => update("clientEmail", e.target.value)}
                  placeholder="maya@company.com"
                />
              </label>
              <label className="span-2">
                Project name
                <input
                  data-testid="input-project-name"
                  required
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="e.g. Northstar brand refresh"
                />
              </label>
              <label>
                Project type
                <select
                  data-testid="select-project-type"
                  value={form.type}
                  onChange={(e) => update("type", e.target.value)}
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
                  data-testid="input-project-budget"
                  type="number"
                  required
                  value={form.budget}
                  onChange={(e) => update("budget", e.target.value)}
                  placeholder="12800"
                />
              </label>
              <label>
                Target deadline
                <input
                  data-testid="input-project-deadline"
                  type="date"
                  required
                  value={form.deadline}
                  onChange={(e) => update("deadline", e.target.value)}
                />
              </label>
            </div>
          </div>
          <div className="form-section">
            <div className="form-section-title">
              <span>02</span>
              <div>
                <h2>The brief</h2>
                <p>What should the work make possible?</p>
              </div>
            </div>
            <label>
              Goals and desired outcome
              <textarea
                data-testid="textarea-project-goals"
                required
                value={form.goals}
                onChange={(e) => update("goals", e.target.value)}
                placeholder="Tell us what success looks like. A few honest sentences are perfect."
                rows={5}
              />
            </label>
            <label>
              Extra context <span className="optional">Optional</span>
              <textarea
                data-testid="textarea-project-notes"
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                placeholder="Known constraints, references, preferences..."
                rows={4}
              />
            </label>
          </div>
          <div className="form-submit">
            <div>
              <Sparkles size={18} />
              <span>
                <strong>StudioFlow will draft your plan</strong>
                <small>
                  Proposal, packages, milestones and tasks — ready to edit.
                </small>
              </span>
            </div>
            <button
              data-testid="button-create-project"
              className="button primary"
              disabled={generating || create.isPending}
            >
              {generating || create.isPending ? (
                <>
                  <Loader2 size={17} className="spin" /> Building your plan…
                </>
              ) : (
                <>
                  <Zap size={16} /> Create project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

