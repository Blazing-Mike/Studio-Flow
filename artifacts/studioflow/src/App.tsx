import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import NotFound from "@/pages/not-found";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type {
  Activity,
  Dashboard,
  Invoice,
  InvoiceInput,
  JobProposal,
  JobProposalInputLength,
  JobProposalInputTone,
  Milestone,
  MilestoneInput,
  Package,
  Project,
  ProjectDetail,
  ProjectUpdate,
  ProposalDraft,
  ProposalUpdate,
  Task,
  TaskInput,
} from "@workspace/api-client-react";
import {
  getGetClientPortalQueryKey,
  getGetProjectQueryKey,
  getGetProjectsQueryKey,
  useApproveProposal,
  useArchiveProject,
  useCreateInvoice,
  useCreateMilestone,
  useCreateProject,
  useCreateTask,
  useDeleteInvoice,
  useDeleteMilestone,
  useDeleteTask,
  useGenerateJobProposal,
  useGenerateProjectPlan,
  useGetClientPortal,
  useGetDashboard,
  useGetProject,
  useGetProjects,
  useRequestProposalChanges,
  useUpdateInvoice,
  useUpdateMilestone,
  useUpdateProject,
  useUpdateProposal,
  useUpdateTask,
} from "@workspace/api-client-react";
import {
  Archive,
  ArrowLeft,
  ArrowUpRight,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Copy,
  FileText,
  FolderOpen,
  Gauge,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Palette,
  Pencil,
  Plus,
  ReceiptText,
  Search,
  Send,
  Settings2,
  Sparkles,
  Target,
  Trash2,
  Users,
  Zap,
} from "lucide-react";
import {
  type CSSProperties,
  type FormEvent,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import {
  Link,
  Route,
  Switch,
  useLocation,
  useParams,
  Router as WouterRouter,
} from "wouter";
import "./index.css";

const queryClient = new QueryClient();

type StudioProfile = {
  name: string;
  studio: string;
  email: string;
  bio: string;
};

const defaultProfile: StudioProfile = {
  name: "Alex Lee",
  studio: "Alex Lee Studio",
  email: "hello@alexlee.studio",
  bio: "Independent brand designer helping thoughtful businesses find their point of view.",
};

function getStoredProfile(): StudioProfile {
  if (typeof window === "undefined") return defaultProfile;
  try {
    const stored = window.localStorage.getItem("studioflow-profile");
    return stored
      ? { ...defaultProfile, ...JSON.parse(stored) }
      : defaultProfile;
  } catch {
    return defaultProfile;
  }
}

function profileInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AL"
  );
}

function useStudioProfile() {
  const [profile, setProfile] = useState<StudioProfile>(getStoredProfile);

  useEffect(() => {
    const refresh = () => setProfile(getStoredProfile());
    window.addEventListener("studioflow-profile-updated", refresh);
    return () =>
      window.removeEventListener("studioflow-profile-updated", refresh);
  }, []);

  return profile;
}

function saveStudioProfile(profile: StudioProfile) {
  window.localStorage.setItem("studioflow-profile", JSON.stringify(profile));
  window.dispatchEvent(new Event("studioflow-profile-updated"));
}

const THEME_KEY = "studioflow-theme";

function getStoredTheme(): string {
  if (typeof window === "undefined") return "warm";
  try {
    return window.localStorage.getItem(THEME_KEY) ?? "warm";
  } catch {
    return "warm";
  }
}

/** Persistent theme ("warm" | "sage" | "ink") applied to the document root. */
function useTheme() {
  const [theme, setTheme] = useState<string>(getStoredTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore storage errors */
    }
  }, [theme]);

  return [theme, setTheme] as const;
}

const sampleProjects: Project[] = [
  {
    id: "p1",
    clientName: "Maya Chen",
    clientEmail: "maya@northstar.studio",
    name: "Northstar brand refresh",
    type: "Brand identity",
    status: "In progress",
    budget: 12800,
    deadline: "2025-04-18",
    progress: 62,
    accent: "#d7a356",
    initials: "MC",
    shareToken: "northstar-demo",
  },
  {
    id: "p2",
    clientName: "Jon Bell",
    clientEmail: "jon@fieldnote.co",
    name: "Fieldnote editorial site",
    type: "Web design",
    status: "Proposal sent",
    budget: 8600,
    deadline: "2025-05-02",
    progress: 18,
    accent: "#79a99a",
    initials: "JB",
    shareToken: "fieldnote-demo",
  },
  {
    id: "p3",
    clientName: "Amelia Park",
    clientEmail: "amelia@arcform.design",
    name: "Arcform launch campaign",
    type: "Creative direction",
    status: "In progress",
    budget: 16400,
    deadline: "2025-03-29",
    progress: 81,
    accent: "#d88471",
    initials: "AP",
    shareToken: "arcform-demo",
  },
  {
    id: "p4",
    clientName: "Ravi Shah",
    clientEmail: "ravi@terrapin.com",
    name: "Terrapin packaging system",
    type: "Packaging",
    status: "Completed",
    budget: 7400,
    deadline: "2025-02-08",
    progress: 100,
    accent: "#9a8ab5",
    initials: "RS",
    shareToken: "terrapin-demo",
  },
];
const sampleActivities: Activity[] = [
  {
    id: "a1",
    actor: "Maya Chen",
    action: "approved the discovery direction",
    time: "18 min ago",
    type: "approval",
  },
  {
    id: "a2",
    actor: "You",
    action: "uploaded “Brand principles v2”",
    time: "2 hours ago",
    type: "file",
  },
  {
    id: "a3",
    actor: "Jon Bell",
    action: "opened the Fieldnote proposal",
    time: "Yesterday",
    type: "view",
  },
  {
    id: "a4",
    actor: "You",
    action: "marked research as complete",
    time: "Yesterday",
    type: "task",
  },
];
const sampleDashboard: Dashboard = {
  revenue: 42860,
  revenueChange: 12.8,
  activeProjects: 3,
  outstanding: 18400,
  outstandingCount: 3,
  upcoming: [
    {
      projectId: "p3",
      projectName: "Arcform launch campaign",
      clientName: "Amelia Park",
      label: "Concept review",
      date: "Mar 21",
      daysLeft: 4,
    },
    {
      projectId: "p1",
      projectName: "Northstar brand refresh",
      clientName: "Maya Chen",
      label: "Presentation",
      date: "Mar 26",
      daysLeft: 9,
    },
    {
      projectId: "p2",
      projectName: "Fieldnote editorial site",
      clientName: "Jon Bell",
      label: "Proposal follow-up",
      date: "Mar 28",
      daysLeft: 11,
    },
  ],
  activity: sampleActivities,
  chart: [
    { month: "Oct", value: 8200 },
    { month: "Nov", value: 11600 },
    { month: "Dec", value: 9400 },
    { month: "Jan", value: 15800 },
    { month: "Feb", value: 13200 },
    { month: "Mar", value: 19400 },
  ],
  projects: sampleProjects,
};

const sampleDetail = (project: Project): ProjectDetail => ({
  ...project,
  goals:
    "Build a clear, ownable visual language that gives the team confidence as they move into their next chapter.",
  notes:
    "The client responds quickly to visual references. Keep presentations focused and create room for them to react.",
  proposal: {
    status: project.status === "Proposal sent" ? "sent" : "draft",
    headline: `A sharper point of view for ${project.clientName.split(" ")[0]}`,
    body: "We will define a memorable identity system and a practical set of tools your team can use every day.",
    selectedPackage: null,
  },
  packages: [
    {
      id: "starter",
      name: "Essentials",
      price: project.budget - 3600,
      description: "A focused foundation for a confident launch.",
      features: [
        "Strategic direction",
        "Core visual identity",
        "Essential handoff kit",
      ],
      recommended: false,
    },
    {
      id: "signature",
      name: "Signature",
      price: project.budget,
      description: "The complete system, shaped around your ambition.",
      features: [
        "Brand strategy workshop",
        "Full visual identity",
        "Launch-ready templates",
        "90-day art direction",
      ],
      recommended: true,
    },
    {
      id: "studio",
      name: "Studio partner",
      price: project.budget + 7200,
      description:
        "A deeper creative partnership from first sketch to final rollout.",
      features: [
        "Everything in Signature",
        "Campaign art direction",
        "Motion toolkit",
        "Weekly creative office hours",
      ],
      recommended: false,
    },
  ],
  milestones: [
    {
      id: "m1",
      name: "Discovery & direction",
      date: "2025-03-14",
      status: "complete",
    },
    {
      id: "m2",
      name: "Concept development",
      date: "2025-03-21",
      status: "current",
    },
    {
      id: "m3",
      name: "Final system & handoff",
      date: "2025-04-11",
      status: "upcoming",
    },
  ],
  tasks: [
    {
      id: "t1",
      title: "Synthesize discovery notes",
      phase: "Direction",
      status: "done",
      dueDate: "2025-03-14",
      assignee: "You",
    },
    {
      id: "t2",
      title: "Prepare concept review",
      phase: "Direction",
      status: "in progress",
      dueDate: "2025-03-21",
      assignee: "You",
    },
    {
      id: "t3",
      title: "Share photography references",
      phase: "Concepts",
      status: "todo",
      dueDate: "2025-03-24",
      assignee: "Maya",
    },
    {
      id: "t4",
      title: "Approve type direction",
      phase: "Concepts",
      status: "todo",
      dueDate: "2025-03-26",
      assignee: "Maya",
    },
  ],
  invoices: [
    {
      id: "i1",
      number: "SF-024",
      amount: Math.round(project.budget * 0.4),
      dueDate: "2025-03-01",
      status: "paid",
      description: "Project deposit",
    },
    {
      id: "i2",
      number: "SF-025",
      amount: Math.round(project.budget * 0.35),
      dueDate: "2025-03-28",
      status: "sent",
      description: "Concept development",
    },
    {
      id: "i3",
      number: "SF-026",
      amount: Math.round(project.budget * 0.25),
      dueDate: "2025-04-18",
      status: "draft",
      description: "Final delivery",
    },
  ],
  activities: sampleActivities,
});

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
function date(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
/** Split an ISO date (or "Mon D" label) into { day, month } for the date-block. */
function dateParts(value: string) {
  const d = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value,
  );
  return {
    day: d.getDate(),
    month: d.toLocaleString("en-US", { month: "short" }),
  };
}
function cx(...names: (string | false | undefined)[]) {
  return names.filter(Boolean).join(" ");
}

function StatusPill({ status }: { status: string }) {
  const tone = status.toLowerCase().replaceAll(" ", "-");
  return (
    <span
      data-testid={`status-${tone}`}
      className={cx(
        "status-pill",
        tone.includes("complete") || tone === "paid" || tone === "done"
          ? "success"
          : tone.includes("progress") || tone === "sent" || tone === "current"
            ? "warm"
            : tone === "draft" || tone === "todo" || tone === "upcoming"
              ? "neutral"
              : "coral",
      )}
    >
      {status}
    </span>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={cx("skeleton", className)} />;
}

function AppShell({ children }: { children: ReactNode }) {
  const [location, navigate] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const profile = useStudioProfile();
  const projectsQuery = useGetProjects();
  const projectCount = projectsQuery.data?.length;
  const links = [
    { href: "/", label: "Overview", icon: LayoutDashboard },
    { href: "/projects", label: "Projects", icon: BriefcaseBusiness },
    { href: "/proposals", label: "Proposals", icon: Send },
    { href: "/settings", label: "Settings", icon: Settings2 },
  ];
  return (
    <div className="app-shell">
      <aside className={cx("sidebar", mobileOpen && "mobile-open")}>
        <div className="brand">
          <div className="brand-mark">
            <Zap size={15} strokeWidth={3} />
          </div>
          <span>
            studio<span>flow</span>
          </span>
        </div>
        <div className="sidebar-label">Workspace</div>
        <nav className="side-nav">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              data-testid={`link-${label.toLowerCase()}`}
              className={cx("side-link", location === href && "active")}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={17} />
              <span>{label}</span>
              {label === "Projects" && projectCount ? (
                <span className="nav-count">{projectCount}</span>
              ) : null}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-label">Your studio</div>
          <div className="studio-card">
            <div className="avatar avatar-amber">
              {profileInitials(profile.name)}
            </div>
            <div>
              <strong>{profile.name}</strong>
              <small>{profile.studio}</small>
            </div>
            <ChevronDown size={14} />
          </div>
          <button
            data-testid="button-sidebar-logout"
            className="side-link subtle"
            onClick={() => navigate("/welcome")}
          >
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
          <div className="demo-note">Demo workspace · sample data</div>
        </div>
      </aside>
      {mobileOpen && (
        <button
          className="mobile-scrim"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        />
      )}
      <main className="main-area">
        <header className="topbar">
          <button
            data-testid="button-mobile-menu"
            className="icon-button mobile-menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="crumb">
            <span>Workspace</span>
            <span className="crumb-slash">/</span>
            <strong>
              {location === "/"
                ? "Overview"
                : location.startsWith("/projects")
                  ? "Projects"
                  : location.startsWith("/proposals")
                    ? "Proposals"
                    : "Settings"}
            </strong>
          </div>
          <div className="top-actions">
            <button
              data-testid="button-search"
              className="icon-button"
              title="Search projects"
              onClick={() => navigate("/projects")}
            >
              <Search size={18} />
            </button>
            <button
              data-testid="button-notifications"
              className="icon-button notification"
              title="You're all caught up"
              onClick={() => navigate("/projects")}
            >
              <Bell size={18} />
              <i />
            </button>
            <div className="avatar avatar-small">
              {profileInitials(profile.name)}
            </div>
          </div>
        </header>
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  meta,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  meta: ReactNode;
  icon: typeof Gauge;
  accent?: string;
}) {
  return (
    <div
      className="stat-card"
      style={{ "--stat-accent": accent } as CSSProperties}
    >
      <div className="stat-top">
        <span>{label}</span>
        <div className="stat-icon">
          <Icon size={17} />
        </div>
      </div>
      <strong
        data-testid={`metric-${label.toLowerCase().replaceAll(" ", "-")}`}
      >
        {value}
      </strong>
      <small>{meta}</small>
    </div>
  );
}

function DashboardPage() {
  const query = useGetDashboard();
  const dashboard = query.data ?? sampleDashboard;
  const profile = useStudioProfile();
  const firstName = profile.name.trim().split(/\s+/)[0] || "there";
  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
  const capacity = Math.min(
    100,
    Math.max(0, Math.round((dashboard.activeProjects / 5) * 100)),
  );
  return (
    <AppShell>
      <div className="page-head reveal">
        <div>
          <p className="eyebrow">{today}</p>
          <h1>
            Good morning, {firstName} <span className="wave-line">—</span>
          </h1>
          <p className="lede">Here’s the shape of your studio today.</p>
        </div>
        <Link
          href="/projects/new"
          data-testid="link-new-project"
          className="button primary"
        >
          <Plus size={17} /> New project
        </Link>
      </div>
      {query.isLoading && (
        <div className="stats-grid">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      )}
      <div className="stats-grid reveal delay-1">
        <StatCard
          label="Revenue this month"
          value={money(dashboard.revenue)}
          meta={
            <>
              {dashboard.revenueChange}%{" "}
              <span className="up">↗ from last month</span>
            </>
          }
          icon={CircleDollarSign}
          accent="#d7a356"
        />
        <StatCard
          label="Active projects"
          value={String(dashboard.activeProjects)}
          meta={`${dashboard.upcoming.length} upcoming milestones`}
          icon={FolderOpen}
          accent="#79a99a"
        />
        <StatCard
          label="Outstanding"
          value={money(dashboard.outstanding)}
          meta={`Across ${dashboard.outstandingCount ?? 0} invoices`}
          icon={ReceiptText}
          accent="#d88471"
        />
        <StatCard
          label="Studio capacity"
          value={`${capacity}%`}
          meta={
            capacity >= 80
              ? "Nearly full — pick carefully"
              : "A good week to say yes"
          }
          icon={Gauge}
          accent="#9a8ab5"
        />
      </div>
      <div className="dashboard-grid reveal delay-2">
        <section className="panel revenue-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Cash flow</p>
              <h2>Revenue overview</h2>
            </div>
            <button
              data-testid="button-revenue-period"
              className="select-button"
            >
              Last 6 months <ChevronDown size={14} />
            </button>
          </div>
          <div className="chart-wrap">
            <div className="chart-y">
              <span>$20k</span>
              <span>$15k</span>
              <span>$10k</span>
              <span>$5k</span>
              <span>$0</span>
            </div>
            <div className="bars">
              {dashboard.chart.map((point, index) => (
                <div className="bar-col" key={point.month}>
                  <div className="bar-value">{money(point.value)}</div>
                  <div
                    className="bar"
                    style={{
                      height: `${Math.max(12, point.value / 200)}px`,
                      animationDelay: `${index * 60}ms`,
                    }}
                  />
                  <span>{point.month}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="panel upcoming-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">The next few days</p>
              <h2>Upcoming</h2>
            </div>
            <CalendarDays size={18} className="panel-icon" />
          </div>
          <div className="upcoming-list">
            {dashboard.upcoming.map((item) => {
              const parts = dateParts(item.date);
              return (
                <Link
                  href={`/projects/${item.projectId}`}
                  key={item.projectId}
                  data-testid={`link-upcoming-${item.projectId}`}
                  className="upcoming-row"
                >
                  <div className="date-block">
                    <strong>{parts.day}</strong>
                    <small>{parts.month}</small>
                  </div>
                  <div className="upcoming-copy">
                    <strong>{item.label}</strong>
                    <span>{item.projectName}</span>
                  </div>
                  <span
                    className={cx("days-left", item.daysLeft < 7 && "soon")}
                  >
                    {item.daysLeft}d
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
      <div className="dashboard-lower reveal delay-3">
        <section className="panel projects-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">In motion</p>
              <h2>Active projects</h2>
            </div>
            <Link
              href="/projects"
              data-testid="link-view-all-projects"
              className="text-link"
            >
              View all <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="project-table">
            {dashboard.projects
              .filter((p) => p.status !== "Completed")
              .map((project) => (
                <ProjectRow key={project.id} project={project} />
              ))}
          </div>
        </section>
        <section className="panel activity-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Live feed</p>
              <h2>Recent activity</h2>
            </div>
            <MessageSquare size={18} className="panel-icon" />
          </div>
          <ActivityList activities={dashboard.activity.slice(0, 4)} />
        </section>
      </div>
    </AppShell>
  );
}

function WelcomePage() {
  return (
    <div className="welcome-shell">
      <header className="welcome-nav">
        <Link href="/" className="brand">
          <div className="brand-mark">
            <Zap size={15} strokeWidth={3} />
          </div>
          <span>
            studio<span>flow</span>
          </span>
        </Link>
        <div className="welcome-nav-actions">
          <Link href="/projects" className="text-link">
            Explore workspace <ArrowUpRight size={15} />
          </Link>
          <Link href="/" className="button dark">
            Open dashboard
          </Link>
        </div>
      </header>
      <main className="welcome-main">
        <section className="welcome-hero">
          <div className="welcome-copy reveal">
            <p className="eyebrow">A calmer way to run creative work</p>
            <h1>
              From first brief
              <br />
              <em>to final yes.</em>
            </h1>
            <p className="welcome-lede">
              StudioFlow gives freelancers and small studios one thoughtful
              place to shape proposals, keep projects moving, and make client
              approvals feel easy.
            </p>
            <div className="welcome-cta">
              <Link href="/" className="button primary">
                <Sparkles size={17} /> Start managing projects
              </Link>
              <span>
                <CheckCircle2 size={15} /> No setup required
              </span>
            </div>
          </div>
          <div className="welcome-preview reveal delay-1">
            <div className="preview-window">
              <div className="preview-window-top">
                <span />
                <span />
                <span />
                <small>studioflow / proposal writer</small>
              </div>
              <div className="preview-window-body">
                <div className="preview-side">
                  <div className="preview-logo">
                    <Zap size={10} />
                  </div>
                  <div className="preview-side-item active">
                    <LayoutDashboard size={12} />
                  </div>
                  <div className="preview-side-item">
                    <FileText size={12} />
                  </div>
                  <div className="preview-side-item">
                    <BriefcaseBusiness size={12} />
                  </div>
                  <div className="preview-side-item">
                    <Users size={12} />
                  </div>
                </div>
                <div className="preview-writer">
                  <div className="preview-writer-head">
                    <div>
                      <p>Proposal writer</p>
                      <h3>
                        From brief to <b>beautiful yes.</b>
                      </h3>
                    </div>
                    <span className="preview-ai-badge">
                      <Sparkles size={10} /> AI assisted
                    </span>
                  </div>
                  <div className="preview-writer-grid">
                    <div className="preview-brief-card">
                      <div className="preview-card-label">
                        <span>Client brief</span>
                        <span className="preview-complete">Ready</span>
                      </div>
                      <strong>Northstar Coffee</strong>
                      <small>Brand + ecommerce refresh</small>
                      <p>
                        A warmer digital home for a thoughtful coffee brand,
                        with a clearer subscription story.
                      </p>
                      <div className="preview-brief-meta">
                        <span>$4,800 budget</span>
                        <span>Aug 29 deadline</span>
                      </div>
                      <div className="preview-generate">
                        <Sparkles size={11} /> Generate proposal
                      </div>
                    </div>
                    <div className="preview-proposal-card">
                      <div className="preview-card-label">
                        <span>Draft proposal</span>
                        <span className="preview-status-dot">Saved</span>
                      </div>
                      <h4>A warmer digital home for your daily ritual</h4>
                      <p>
                        Northstar has already built a beautiful product. This
                        project gives that product a digital experience with the
                        same care.
                      </p>
                      <div className="preview-package-row">
                        <span>Starter</span>
                        <span className="selected">Growth · $4,800</span>
                        <span>Signature</span>
                      </div>
                      <div className="preview-proposal-actions">
                        <span>
                          <Copy size={10} /> Copy proposal
                        </span>
                        <span>
                          <ArrowUpRight size={10} /> Client portal
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="preview-writer-footer">
                    <span>
                      <CheckCircle2 size={11} /> Proposal, packages, and next
                      steps ready
                    </span>
                    <span>2 min ago</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="preview-note">
              <Sparkles size={15} />
              <span>
                <strong>Write proposals faster</strong>
                <small>Brief in. Client-ready copy out.</small>
              </span>
            </div>
          </div>
        </section>
        <section className="welcome-proof">
          <p className="eyebrow">Everything that keeps a studio moving</p>
          <div className="proof-grid">
            <div>
              <span className="proof-number">01</span>
              <h2>Write proposals that sound like you.</h2>
              <p>
                Turn a job brief or client notes into thoughtful proposal copy,
                clear package options, and a confident next step.
              </p>
            </div>
            <div>
              <span className="proof-number">02</span>
              <h2>Keep the work in motion.</h2>
              <p>
                Milestones, tasks, invoices, and client activity stay close
                enough to act on.
              </p>
            </div>
            <div>
              <span className="proof-number">03</span>
              <h2>Get to yes, more naturally.</h2>
              <p>
                Give clients a considered portal where they can choose, approve,
                and leave useful notes.
              </p>
            </div>
          </div>
        </section>
      </main>
      <footer className="welcome-footer">
        <span>StudioFlow</span>
        <span>Built for independent studios with a lot of care.</span>
        <Link href="/settings">
          Make it yours <ArrowUpRight size={14} />
        </Link>
      </footer>
    </div>
  );
}

function ProjectRow({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      data-testid={`row-project-${project.id}`}
      className="project-row"
    >
      <div className="project-accent" style={{ background: project.accent }} />
      <div
        className="project-client-avatar"
        style={{ background: `${project.accent}25`, color: project.accent }}
      >
        {project.initials}
      </div>
      <div className="project-row-main">
        <strong>{project.name}</strong>
        <span>
          {project.clientName} · {project.type}
        </span>
      </div>
      <div className="row-progress">
        <div className="progress-label">
          <span>{project.progress}%</span>
          <small>complete</small>
        </div>
        <div className="progress-track">
          <i
            style={{
              width: `${project.progress}%`,
              background: project.accent,
            }}
          />
        </div>
      </div>
      <StatusPill status={project.status} />
      <ArrowUpRight size={16} className="row-arrow" />
    </Link>
  );
}

function ActivityList({ activities }: { activities: Activity[] }) {
  return (
    <div className="activity-list">
      {activities.map((activity) => (
        <div className="activity-item" key={activity.id}>
          <div className={cx("activity-dot", activity.type)}>
            {activity.type === "approval" ? (
              <Check size={13} />
            ) : activity.type === "file" ? (
              <FileText size={13} />
            ) : (
              <Clock3 size={13} />
            )}
          </div>
          <div>
            <p>
              <strong>{activity.actor}</strong> {activity.action}
            </p>
            <span>{activity.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectsPage() {
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

function NewProjectPage() {
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

function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const query = useGetProject(id ?? "", {
    query: { enabled: !!id, queryKey: getGetProjectQueryKey(id ?? "") },
  });
  const fallback = sampleProjects.find((p) => p.id === id) ?? sampleProjects[0];
  const project = query.data ?? sampleDetail(fallback);
  const [tab, setTab] = useState("Overview");
  const generate = useGenerateProjectPlan();
  const [generated, setGenerated] = useState(false);
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
  const doGenerate = () => {
    setGenerated(true);
    generate.mutate(
      { id: id ?? "" },
      {
        onSuccess: () => {
          setGenerated(false);
          refresh();
        },
        onError: () => setTimeout(() => setGenerated(false), 1000),
      },
    );
  };
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
          <button data-testid="button-workspace-more" className="icon-button">
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
                onGenerate={doGenerate}
                generating={generated || generate.isPending}
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
}: {
  project: ProjectDetail;
  onGenerate: () => void;
  generating: boolean;
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
                <Loader2 size={16} className="spin" /> Thinking through it…
              </>
            ) : (
              <>
                <Sparkles size={16} /> Generate project plan
              </>
            )}
          </button>
          {generating && (
            <p className="generate-note">
              <Loader2 size={12} className="spin" /> Drafting your proposal,
              packages, and timeline…
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
function PackageCard({
  pkg,
  selected,
  onSelect,
}: {
  pkg: Package;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      data-testid={`button-package-${pkg.id}`}
      className={cx("package-card", selected && "selected")}
      onClick={onSelect}
    >
      <div className="package-card-top">
        <div>
          <span className="package-name">{pkg.name}</span>
          {pkg.recommended && <span className="recommended">Recommended</span>}
        </div>
        <strong>{money(pkg.price)}</strong>
      </div>
      <p>{pkg.description}</p>
      <ul>
        {pkg.features.map((feature) => (
          <li key={feature}>
            <Check size={14} /> {feature}
          </li>
        ))}
      </ul>
      <div className={cx("radio", selected && "checked")}>
        {selected && <i />}
      </div>
    </button>
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
                  onClick={() => startEdit(milestone)}
                >
                  <Pencil size={14} />
                </button>
                <button
                  className="icon-button tiny"
                  title="Delete milestone"
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
                onClick={() => startEdit(task)}
              >
                <Pencil size={14} />
              </button>
              <button
                className="icon-button tiny"
                title="Delete task"
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
              onClick={() => startEdit(invoice)}
            >
              <Pencil size={14} />
            </button>
            <button
              className="icon-button tiny"
              title="Delete invoice"
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

function PortalPage() {
  const { token } = useParams<{ token: string }>();
  const query = useGetClientPortal(token ?? "", {
    query: {
      enabled: !!token,
      queryKey: getGetClientPortalQueryKey(token ?? ""),
    },
  });
  const fallback =
    sampleProjects.find((p) => p.shareToken === token) ?? sampleProjects[0];
  const project = query.data ?? sampleDetail(fallback);
  const approve = useApproveProposal();
  const request = useRequestProposalChanges();
  const [selected, setSelected] = useState(
    project.proposal.selectedPackage ?? "signature",
  );
  const [note, setNote] = useState("");
  const [decision, setDecision] = useState("");
  const submit = (kind: "approve" | "changes") => {
    const mutation = kind === "approve" ? approve : request;
    mutation.mutate(
      { id: project.id, data: { packageId: selected, note } },
      {
        onSuccess: () => {
          setDecision(kind);
          toast({
            title:
              kind === "approve" ? "Proposal approved" : "Changes requested",
            description:
              kind === "approve"
                ? "The client confirmed the proposal. Kickoff is on."
                : "The client sent notes back to the studio.",
          });
        },
        onError: () => {
          toast({
            title: "Couldn’t send",
            description: "Something went wrong. Please try again.",
          });
        },
      },
    );
  };
  return (
    <div className="portal-shell">
      <header className="portal-header">
        <Link href="/" className="brand portal-brand">
          <div className="brand-mark">
            <Zap size={15} strokeWidth={3} />
          </div>
          <span>
            studio<span>flow</span>
          </span>
        </Link>
        <div className="portal-by">
          A proposal from <strong>Alex Lee</strong>
          <span className="portal-avatar">AL</span>
        </div>
      </header>
      <main className="portal-main">
        {decision ? (
          <div className="portal-success">
            <div className="success-mark">
              <Check size={27} />
            </div>
            <p className="eyebrow">
              {decision === "approve" ? "We’re on" : "Back to the studio"}
            </p>
            <h1>
              {decision === "approve" ? "A great choice." : "Notes received."}
            </h1>
            <p>
              {decision === "approve"
                ? "Alex has been notified and will be in touch with the next step shortly."
                : "Alex has your notes and will come back with a considered update."}
            </p>
            <button
              data-testid="button-portal-return"
              className="button dark"
              onClick={() => setDecision("")}
            >
              Review proposal again
            </button>
          </div>
        ) : (
          <>
            <div className="portal-hero">
              <p className="eyebrow">A proposal for {project.clientName}</p>
              <h1>{project.proposal.headline}</h1>
              <p>{project.proposal.body}</p>
              <div className="portal-meta">
                <span>
                  <CalendarDays size={15} /> Target delivery{" "}
                  {date(project.deadline)}
                </span>
                <span>
                  <Users size={15} /> Prepared by Alex Lee
                </span>
              </div>
            </div>
            <section className="portal-section">
              <div className="portal-section-heading">
                <div>
                  <p className="eyebrow">Choose what fits</p>
                  <h2>Ways we can work together</h2>
                </div>
                <span>All prices in USD</span>
              </div>
              <div className="portal-packages">
                {project.packages.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    pkg={pkg}
                    selected={selected === pkg.id}
                    onSelect={() => setSelected(pkg.id)}
                  />
                ))}
              </div>
            </section>
            <section className="portal-bottom">
              <div>
                <p className="eyebrow">Once we’re aligned</p>
                <h2>A thoughtful process, with room to think.</h2>
                <div className="portal-timeline">
                  {project.milestones.map((m) => (
                    <div key={m.id}>
                      <span>{date(m.date)}</span>
                      <strong>{m.name}</strong>
                    </div>
                  ))}
                </div>
              </div>
              <div className="portal-decision">
                <p className="eyebrow">Ready when you are</p>
                <h3>What do you think?</h3>
                <textarea
                  data-testid="textarea-portal-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="A note for Alex (optional)"
                />
                <button
                  data-testid="button-approve-proposal"
                  className="button dark full"
                  disabled={approve.isPending}
                  onClick={() => submit("approve")}
                >
                  <CheckCircle2 size={17} /> Approve{" "}
                  {project.packages.find((p) => p.id === selected)?.name}
                </button>
                <button
                  data-testid="button-request-changes"
                  className="button text-button full"
                  onClick={() => submit("changes")}
                >
                  I’d like to request changes
                </button>
              </div>
            </section>
          </>
        )}
      </main>
      <footer className="portal-footer">
        StudioFlow <span>·</span> A calmer way to run creative work.
      </footer>
    </div>
  );
}

const PROPOSAL_DRAFTS_KEY = "studioflow-proposal-drafts";

function loadLocalDrafts(): ProposalDraft[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(PROPOSAL_DRAFTS_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalDrafts(drafts: ProposalDraft[]) {
  try {
    window.localStorage.setItem(PROPOSAL_DRAFTS_KEY, JSON.stringify(drafts));
  } catch {
    /* ignore quota / storage errors */
  }
}

function ProposalsPage() {
  const write = useGenerateJobProposal();
  const profile = useStudioProfile();
  const [drafts, setDrafts] = useState<ProposalDraft[]>(loadLocalDrafts);
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [tone, setTone] = useState<JobProposalInputTone>("confident");
  const [length, setLength] = useState<JobProposalInputLength>("standard");
  const [portfolio, setPortfolio] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [job, setJob] = useState<JobProposal["job"]>(undefined);
  const [proposal, setProposal] = useState("");
  const [source, setSource] = useState("");
  const [needsDescription, setNeedsDescription] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const loading = write.isPending;

  const applyDraft = (draft: ProposalDraft) => {
    setProposal(draft.proposal);
    setSource(draft.source ?? "");
    setTone((draft.tone as JobProposalInputTone) ?? "confident");
    setLength((draft.length as JobProposalInputLength) ?? "standard");
    if (draft.title)
      setJob({ title: draft.title, org: draft.org, url: draft.url });
    setNeedsDescription(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const run = () => {
    setError("");
    write.mutate(
      {
        data: {
          url: url.trim() || undefined,
          description: description.trim() || undefined,
          portfolioUrl: portfolioUrl.trim() || undefined,
          tone,
          length,
          profile: {
            name: profile.name,
            studio: profile.studio,
            email: profile.email,
            bio: profile.bio,
            portfolio: portfolio.trim() || undefined,
          },
        },
      },
      {
        onSuccess: (data) => {
          setJob(data.job);
          setProposal(data.proposal ?? "");
          setSource(data.source ?? "");
          setNeedsDescription(Boolean(data.needsDescription));
          if (data.job?.description && !description.trim())
            setDescription(data.job.description);
          if (data.draft) {
            const draft = data.draft;
            setDrafts((prev) => {
              const next = [draft, ...prev];
              saveLocalDrafts(next);
              return next;
            });
          }
        },
        onError: () => {
          setError(
            "Something went wrong drafting the proposal. Please try again.",
          );
        },
      },
    );
  };

  const remove = (id: string) =>
    setDrafts((prev) => {
      const next = prev.filter((d) => d.id !== id);
      saveLocalDrafts(next);
      return next;
    });
  const copy = () => {
    navigator.clipboard?.writeText(proposal);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <AppShell>
      <div className="page-head reveal">
        <div>
          <p className="eyebrow">Land the gig</p>
          <h1>Proposal writer</h1>
          <p className="lede">
            Paste a job link — or the posting — and get a tailored proposal
            ready to copy into your application.
          </p>
        </div>
        <div className="ai-stamp">
          <Sparkles size={15} /> Gemini-powered
        </div>
      </div>
      <div className="proposal-writer reveal delay-1">
        <section className="panel writer-card">
          <div className="writer-step">
            <span>1</span>
            <div>
              <h3>Paste the job</h3>
              <p>
                A Contra, Upwork, or any job posting link — we’ll read it for
                you.
              </p>
            </div>
          </div>
          <label>
            Job link
            <input
              data-testid="input-job-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://contra.com/opportunity/..."
            />
          </label>
          {needsDescription && (
            <div className="writer-note">
              <Sparkles size={14} /> We couldn’t read that page. Paste the
              posting text below instead.
            </div>
          )}
          {needsDescription && (
            <label>
              Job description
              <textarea
                data-testid="textarea-job-description"
                rows={8}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Paste the full job description here..."
              />
            </label>
          )}

          <div className="writer-step">
            <span>2</span>
            <div>
              <h3>Tune it</h3>
              <p>
                Tone and length make the difference — add portfolio proof to
                seal it.
              </p>
            </div>
          </div>
          <div className="writer-tune">
            <label>
              Tone
              <select
                data-testid="select-tone"
                value={tone}
                onChange={(e) =>
                  setTone(e.target.value as JobProposalInputTone)
                }
              >
                <option value="confident">Confident & direct</option>
                <option value="consultative">Consultative & curious</option>
                <option value="warm">Warm & personal</option>
              </select>
            </label>
            <label>
              Length
              <select
                data-testid="select-length"
                value={length}
                onChange={(e) =>
                  setLength(e.target.value as JobProposalInputLength)
                }
              >
                <option value="short">Short · ~120 words</option>
                <option value="standard">Standard · ~200 words</option>
                <option value="detailed">Detailed · ~350 words</option>
              </select>
            </label>
          </div>
          <button
            type="button"
            className="text-link writer-portfolio-toggle"
            data-testid="button-portfolio-toggle"
            onClick={() => setShowPortfolio((p) => !p)}
          >
            <ChevronDown
              size={13}
              className={cx("writer-chevron", showPortfolio && "open")}
            />{" "}
            {showPortfolio
              ? "Hide portfolio context"
              : "Add relevant work / portfolio (link or paste)"}
          </button>
          {showPortfolio && (
            <>
              <label>
                Portfolio / Contra profile link
                <input
                  data-testid="input-portfolio-url"
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://contra.com/your_username"
                />
              </label>
              <p className="writer-hint">
                <Sparkles size={14} /> We’ll read your work &amp; case studies
                once and auto-pick the most relevant proof for this job.
              </p>
              <label>
                Or paste relevant work
                <textarea
                  data-testid="textarea-portfolio"
                  rows={4}
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                  placeholder="e.g. Wrote 30+ UGC ad scripts for a DTC skincare brand; hooks that lifted CTR 2.4×. Happy to share samples."
                />
              </label>
            </>
          )}

          {error && <p className="writer-error">{error}</p>}
          <div className="editor-actions">
            <button
              data-testid="button-write-proposal"
              className="button primary"
              onClick={run}
              disabled={loading || (!url.trim() && !description.trim())}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="spin" /> Writing…
                </>
              ) : (
                <>
                  <Sparkles size={16} />{" "}
                  {description.trim() && !needsDescription
                    ? "Rewrite proposal"
                    : "Read job & write proposal"}
                </>
              )}
            </button>
          </div>
        </section>
        {job && (
          <section className="panel job-summary">
            <div className="job-summary-icon">
              <BriefcaseBusiness size={17} />
            </div>
            <div className="job-summary-copy">
              <p className="eyebrow">Reading the posting</p>
              <h3>{job.title}</h3>
              <span>
                {job.org ? `${job.org} · ` : ""}
                {job.employmentType ?? "Freelance"}
              </span>
              {job.url && (
                <a
                  href={job.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-link"
                >
                  Open original <ArrowUpRight size={13} />
                </a>
              )}
            </div>
          </section>
        )}
        {proposal && (
          <section className="panel proposal-result">
            <div className="panel-head">
              <div>
                <p className="eyebrow">Copy, refine, send</p>
                <h2>Your draft</h2>
              </div>
              <div className="proposal-result-actions">
                <span className={cx("source-badge", source === "ai" && "ai")}>
                  {source === "ai" ? "AI draft" : "Template draft"}
                </span>
                <button
                  data-testid="button-copy-proposal"
                  className="button outline"
                  onClick={copy}
                >
                  {copied ? (
                    <>
                      <Check size={15} /> Copied
                    </>
                  ) : (
                    <>
                      <Copy size={15} /> Copy proposal
                    </>
                  )}
                </button>
              </div>
            </div>
            <pre className="proposal-text">{proposal}</pre>
          </section>
        )}
        {drafts.length > 0 && (
          <section className="panel history-panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow">Saved drafts</p>
                <h2>History</h2>
              </div>
              <Clock3 size={16} className="panel-icon" />
            </div>
            <div className="history-list">
              {drafts.map((draft) => (
                <div className="history-row" key={draft.id}>
                  <div className="history-copy">
                    <strong>{draft.title ?? "Untitled proposal"}</strong>
                    <span>
                      {draft.org ? `${draft.org} · ` : ""}
                      {new Date(draft.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      · {draft.source === "ai" ? "AI" : "Template"} ·{" "}
                      {draft.length ?? "standard"}
                    </span>
                  </div>
                  <div className="history-actions">
                    <button
                      className="button tiny-outline"
                      data-testid={`button-load-draft-${draft.id}`}
                      onClick={() => applyDraft(draft)}
                    >
                      Open
                    </button>
                    <button
                      className="icon-button tiny"
                      data-testid={`button-delete-draft-${draft.id}`}
                      title="Delete draft"
                      onClick={() => remove(draft.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}

function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [theme, setTheme] = useTheme();
  const profile = useStudioProfile();
  const [form, setForm] = useState<StudioProfile>(profile);
  const update = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));
  const save = (e: FormEvent) => {
    e.preventDefault();
    saveStudioProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };
  return (
    <AppShell>
      <div className="page-head reveal">
        <div>
          <p className="eyebrow">Your space, your rules</p>
          <h1>Settings</h1>
          <p className="lede">Shape how your studio shows up.</p>
        </div>
        {saved && (
          <span className="saved-note">
            <Check size={15} /> Saved
          </span>
        )}
      </div>
      <form className="settings-grid reveal delay-1" onSubmit={save}>
        <section className="panel settings-section">
          <div className="settings-heading">
            <div className="settings-icon">
              <Users size={18} />
            </div>
            <div>
              <h2>Freelancer profile</h2>
              <p>This appears on client-facing proposals.</p>
            </div>
          </div>
          <div className="settings-fields">
            <label>
              Full name
              <input
                data-testid="input-settings-name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </label>
            <label>
              Studio name
              <input
                data-testid="input-settings-studio"
                value={form.studio}
                onChange={(e) => update("studio", e.target.value)}
              />
            </label>
            <label>
              Email address
              <input
                data-testid="input-settings-email"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </label>
            <label className="span-2">
              Short bio
              <textarea
                data-testid="textarea-settings-bio"
                rows={3}
                value={form.bio}
                onChange={(e) => update("bio", e.target.value)}
              />
            </label>
          </div>
        </section>
        <section className="panel settings-section">
          <div className="settings-heading">
            <div className="settings-icon amber">
              <Palette size={18} />
            </div>
            <div>
              <h2>Brand & appearance</h2>
              <p>A little personality goes a long way.</p>
            </div>
          </div>
          <div className="theme-choices">
            {[
              ["warm", "Warm paper", "#f4f0e8"],
              ["sage", "Quiet sage", "#e7eee7"],
              ["ink", "Ink & cream", "#20373b"],
            ].map(([value, label, color]) => (
              <button
                type="button"
                data-testid={`button-theme-${value}`}
                key={value}
                className={cx("theme-choice", theme === value && "selected")}
                onClick={() => setTheme(value)}
              >
                <span style={{ background: color }} />
                <strong>{label}</strong>
                {theme === value && <Check size={15} />}
              </button>
            ))}
          </div>
        </section>
        <section className="panel settings-section">
          <div className="settings-heading">
            <div className="settings-icon green">
              <CircleDollarSign size={18} />
            </div>
            <div>
              <h2>Payments</h2>
              <p>Defaults for your invoices and deposits.</p>
            </div>
          </div>
          <div className="payment-row">
            <div>
              <strong>USD · United States Dollar</strong>
              <span>Default currency</span>
            </div>
            <CheckCircle2 size={19} />
          </div>
          <div className="payment-row">
            <div>
              <strong>40% deposit</strong>
              <span>Suggested for new projects</span>
            </div>
            <ChevronDown size={17} />
          </div>
        </section>
        <div className="settings-save">
          <span>Changes are saved to this workspace.</span>
          <button
            data-testid="button-save-settings"
            className="button primary"
            type="submit"
          >
            Save changes
          </button>
        </div>
      </form>
    </AppShell>
  );
}

function Router() {
  return (
    <ErrorBoundary>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/welcome" component={WelcomePage} />
        <Route path="/projects" component={ProjectsPage} />
        <Route path="/projects/new" component={NewProjectPage} />
        <Route path="/projects/:id" component={ProjectPage} />
        <Route path="/portal/:token" component={PortalPage} />
        <Route path="/proposals" component={ProposalsPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route component={NotFound} />
      </Switch>
    </ErrorBoundary>
  );
}
function App() {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", getStoredTheme());
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
export default App;
