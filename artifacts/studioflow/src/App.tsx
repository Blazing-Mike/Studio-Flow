import { type CSSProperties, type FormEvent, type MouseEvent, type ReactNode, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Link, Route, Switch, useLocation, useParams, Router as WouterRouter } from 'wouter';
import {
  ArrowUpRight, Archive, ArrowLeft, Bell, BriefcaseBusiness, CalendarDays, Check,
  CheckCircle2, ChevronDown, CircleDollarSign, Clock3, Copy, FileText, FolderOpen,
  Gauge, LayoutDashboard, ListChecks, Loader2, LogOut, Menu, MessageSquare,
  MoreHorizontal, Palette, Plus, ReceiptText, Search, Send, Settings2, Sparkles,
  Target, Users, X, Zap
} from 'lucide-react';
import {
  getGetClientPortalQueryKey, getGetProjectQueryKey, getGetProjectsQueryKey,
  useApproveProposal, useArchiveProject, useCreateProject,
  useGenerateProjectPlan, useGetClientPortal, useGetDashboard, useGetProject,
  useGetProjects, useRequestProposalChanges, useUpdateInvoice, useUpdateProject, useUpdateTask
} from '@workspace/api-client-react';
import type {
  Activity, Dashboard, Invoice, Milestone, Package, Project, ProjectDetail, Task
} from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import './index.css';

const queryClient = new QueryClient();

type StudioProfile = {
  name: string;
  studio: string;
  email: string;
  bio: string;
};

const defaultProfile: StudioProfile = {
  name: 'Alex Lee',
  studio: 'Alex Lee Studio',
  email: 'hello@alexlee.studio',
  bio: 'Independent brand designer helping thoughtful businesses find their point of view.',
};

function getStoredProfile(): StudioProfile {
  if (typeof window === 'undefined') return defaultProfile;
  try {
    const stored = window.localStorage.getItem('studioflow-profile');
    return stored ? { ...defaultProfile, ...JSON.parse(stored) } : defaultProfile;
  } catch {
    return defaultProfile;
  }
}

function profileInitials(name: string) {
  return name.trim().split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'AL';
}

function useStudioProfile() {
  const [profile, setProfile] = useState<StudioProfile>(getStoredProfile);

  useEffect(() => {
    const refresh = () => setProfile(getStoredProfile());
    window.addEventListener('studioflow-profile-updated', refresh);
    return () => window.removeEventListener('studioflow-profile-updated', refresh);
  }, []);

  return profile;
}

function saveStudioProfile(profile: StudioProfile) {
  window.localStorage.setItem('studioflow-profile', JSON.stringify(profile));
  window.dispatchEvent(new Event('studioflow-profile-updated'));
}

const sampleProjects: Project[] = [
  { id: 'p1', clientName: 'Maya Chen', clientEmail: 'maya@northstar.studio', name: 'Northstar brand refresh', type: 'Brand identity', status: 'In progress', budget: 12800, deadline: '2025-04-18', progress: 62, accent: '#d7a356', initials: 'MC', shareToken: 'northstar-demo' },
  { id: 'p2', clientName: 'Jon Bell', clientEmail: 'jon@fieldnote.co', name: 'Fieldnote editorial site', type: 'Web design', status: 'Proposal sent', budget: 8600, deadline: '2025-05-02', progress: 18, accent: '#79a99a', initials: 'JB', shareToken: 'fieldnote-demo' },
  { id: 'p3', clientName: 'Amelia Park', clientEmail: 'amelia@arcform.design', name: 'Arcform launch campaign', type: 'Creative direction', status: 'In progress', budget: 16400, deadline: '2025-03-29', progress: 81, accent: '#d88471', initials: 'AP', shareToken: 'arcform-demo' },
  { id: 'p4', clientName: 'Ravi Shah', clientEmail: 'ravi@terrapin.com', name: 'Terrapin packaging system', type: 'Packaging', status: 'Completed', budget: 7400, deadline: '2025-02-08', progress: 100, accent: '#9a8ab5', initials: 'RS', shareToken: 'terrapin-demo' },
];
const sampleActivities: Activity[] = [
  { id: 'a1', actor: 'Maya Chen', action: 'approved the discovery direction', time: '18 min ago', type: 'approval' },
  { id: 'a2', actor: 'You', action: 'uploaded “Brand principles v2”', time: '2 hours ago', type: 'file' },
  { id: 'a3', actor: 'Jon Bell', action: 'opened the Fieldnote proposal', time: 'Yesterday', type: 'view' },
  { id: 'a4', actor: 'You', action: 'marked research as complete', time: 'Yesterday', type: 'task' },
];
const sampleDashboard: Dashboard = {
  revenue: 42860, revenueChange: 12.8, activeProjects: 3, outstanding: 18400,
  upcoming: [
    { projectId: 'p3', projectName: 'Arcform launch campaign', clientName: 'Amelia Park', label: 'Concept review', date: 'Mar 21', daysLeft: 4 },
    { projectId: 'p1', projectName: 'Northstar brand refresh', clientName: 'Maya Chen', label: 'Presentation', date: 'Mar 26', daysLeft: 9 },
    { projectId: 'p2', projectName: 'Fieldnote editorial site', clientName: 'Jon Bell', label: 'Proposal follow-up', date: 'Mar 28', daysLeft: 11 },
  ],
  activity: sampleActivities, chart: [
    { month: 'Oct', value: 8200 }, { month: 'Nov', value: 11600 }, { month: 'Dec', value: 9400 },
    { month: 'Jan', value: 15800 }, { month: 'Feb', value: 13200 }, { month: 'Mar', value: 19400 },
  ], projects: sampleProjects
};

const sampleDetail = (project: Project): ProjectDetail => ({
  ...project,
  goals: 'Build a clear, ownable visual language that gives the team confidence as they move into their next chapter.',
  notes: 'The client responds quickly to visual references. Keep presentations focused and create room for them to react.',
  proposal: { status: project.status === 'Proposal sent' ? 'sent' : 'draft', headline: `A sharper point of view for ${project.clientName.split(' ')[0]}`, body: 'We will define a memorable identity system and a practical set of tools your team can use every day.', selectedPackage: null },
  packages: [
    { id: 'starter', name: 'Essentials', price: project.budget - 3600, description: 'A focused foundation for a confident launch.', features: ['Strategic direction', 'Core visual identity', 'Essential handoff kit'], recommended: false },
    { id: 'signature', name: 'Signature', price: project.budget, description: 'The complete system, shaped around your ambition.', features: ['Brand strategy workshop', 'Full visual identity', 'Launch-ready templates', '90-day art direction'], recommended: true },
    { id: 'studio', name: 'Studio partner', price: project.budget + 7200, description: 'A deeper creative partnership from first sketch to final rollout.', features: ['Everything in Signature', 'Campaign art direction', 'Motion toolkit', 'Weekly creative office hours'], recommended: false },
  ],
  milestones: [
    { id: 'm1', name: 'Discovery & direction', date: '2025-03-14', status: 'complete' },
    { id: 'm2', name: 'Concept development', date: '2025-03-21', status: 'current' },
    { id: 'm3', name: 'Final system & handoff', date: '2025-04-11', status: 'upcoming' },
  ],
  tasks: [
    { id: 't1', title: 'Synthesize discovery notes', phase: 'Direction', status: 'done', dueDate: '2025-03-14', assignee: 'You' },
    { id: 't2', title: 'Prepare concept review', phase: 'Direction', status: 'in progress', dueDate: '2025-03-21', assignee: 'You' },
    { id: 't3', title: 'Share photography references', phase: 'Concepts', status: 'todo', dueDate: '2025-03-24', assignee: 'Maya' },
    { id: 't4', title: 'Approve type direction', phase: 'Concepts', status: 'todo', dueDate: '2025-03-26', assignee: 'Maya' },
  ],
  invoices: [
    { id: 'i1', number: 'SF-024', amount: Math.round(project.budget * .4), dueDate: '2025-03-01', status: 'paid', description: 'Project deposit' },
    { id: 'i2', number: 'SF-025', amount: Math.round(project.budget * .35), dueDate: '2025-03-28', status: 'sent', description: 'Concept development' },
    { id: 'i3', number: 'SF-026', amount: Math.round(project.budget * .25), dueDate: '2025-04-18', status: 'draft', description: 'Final delivery' },
  ],
  activities: sampleActivities
});

function money(value: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value); }
function date(value: string) { return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(value)); }
function cx(...names: (string | false | undefined)[]) { return names.filter(Boolean).join(' '); }

function StatusPill({ status }: { status: string }) {
  const tone = status.toLowerCase().replaceAll(' ', '-');
  return <span data-testid={`status-${tone}`} className={cx('status-pill', tone.includes('complete') || tone === 'paid' || tone === 'done' ? 'success' : tone.includes('progress') || tone === 'sent' || tone === 'current' ? 'warm' : tone === 'draft' || tone === 'todo' || tone === 'upcoming' ? 'neutral' : 'coral')}>{status}</span>;
}

function Skeleton({ className = '' }: { className?: string }) { return <div className={cx('skeleton', className)} />; }

function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const profile = useStudioProfile();
  const links = [
    { href: '/', label: 'Overview', icon: LayoutDashboard },
    { href: '/projects', label: 'Projects', icon: BriefcaseBusiness },
    { href: '/settings', label: 'Settings', icon: Settings2 },
  ];
  return <div className="app-shell">
    <aside className={cx('sidebar', mobileOpen && 'mobile-open')}>
      <div className="brand"><div className="brand-mark"><Zap size={15} strokeWidth={3} /></div><span>studio<span>flow</span></span></div>
      <div className="sidebar-label">Workspace</div>
      <nav className="side-nav">{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} data-testid={`link-${label.toLowerCase()}`} className={cx('side-link', location === href && 'active')} onClick={() => setMobileOpen(false)}><Icon size={17} /><span>{label}</span>{label === 'Projects' && <span className="nav-count">4</span>}</Link>)}</nav>
      <div className="sidebar-bottom">
        <div className="sidebar-label">Your studio</div>
        <div className="studio-card"><div className="avatar avatar-amber">{profileInitials(profile.name)}</div><div><strong>{profile.name}</strong><small>{profile.studio}</small></div><ChevronDown size={14} /></div>
        <button data-testid="button-sidebar-logout" className="side-link subtle"><LogOut size={16} /><span>Sign out</span></button>
      </div>
    </aside>
    {mobileOpen && <button className="mobile-scrim" onClick={() => setMobileOpen(false)} aria-label="Close menu" />}
    <main className="main-area">
      <header className="topbar"><button data-testid="button-mobile-menu" className="icon-button mobile-menu" onClick={() => setMobileOpen(true)}><Menu size={20} /></button><div className="crumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>{location === '/' ? 'Overview' : location.startsWith('/projects') ? 'Projects' : 'Settings'}</strong></div><div className="top-actions"><button data-testid="button-search" className="icon-button"><Search size={18} /></button><button data-testid="button-notifications" className="icon-button notification"><Bell size={18} /><i /></button><div className="avatar avatar-small">{profileInitials(profile.name)}</div></div></header>
      <div className="page-content">{children}</div>
    </main>
  </div>;
}

function StatCard({ label, value, meta, icon: Icon, accent }: { label: string; value: string; meta: ReactNode; icon: typeof Gauge; accent?: string }) {
  return <div className="stat-card" style={{ '--stat-accent': accent } as CSSProperties}><div className="stat-top"><span>{label}</span><div className="stat-icon"><Icon size={17} /></div></div><strong data-testid={`metric-${label.toLowerCase().replaceAll(' ', '-')}`}>{value}</strong><small>{meta}</small></div>;
}

function DashboardPage() {
  const query = useGetDashboard();
  const dashboard = query.data ?? sampleDashboard;
  const profile = useStudioProfile();
  const firstName = profile.name.trim().split(/\s+/)[0] || 'there';
  return <AppShell><div className="page-head reveal"><div><p className="eyebrow">Tuesday, March 18, 2025</p><h1>Good morning, {firstName} <span className="wave-line">—</span></h1><p className="lede">Here’s the shape of your studio today.</p></div><Link href="/projects/new" data-testid="link-new-project" className="button primary"><Plus size={17} /> New project</Link></div>
    {query.isLoading && <div className="stats-grid">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-36" />)}</div>}
    <div className="stats-grid reveal delay-1"><StatCard label="Revenue this month" value={money(dashboard.revenue)} meta={<>{dashboard.revenueChange}% <span className="up">↗ from last month</span></>} icon={CircleDollarSign} accent="#d7a356" /><StatCard label="Active projects" value={String(dashboard.activeProjects)} meta="2 need your attention" icon={FolderOpen} accent="#79a99a" /><StatCard label="Outstanding" value={money(dashboard.outstanding)} meta="Across 2 invoices" icon={ReceiptText} accent="#d88471" /><StatCard label="Studio capacity" value="72%" meta="A good week to say yes" icon={Gauge} accent="#9a8ab5" /></div>
    <div className="dashboard-grid reveal delay-2"><section className="panel revenue-panel"><div className="panel-head"><div><p className="eyebrow">Cash flow</p><h2>Revenue overview</h2></div><button data-testid="button-revenue-period" className="select-button">Last 6 months <ChevronDown size={14} /></button></div><div className="chart-wrap"><div className="chart-y"><span>$20k</span><span>$15k</span><span>$10k</span><span>$5k</span><span>$0</span></div><div className="bars">{dashboard.chart.map((point, index) => <div className="bar-col" key={point.month}><div className="bar-value">{money(point.value)}</div><div className="bar" style={{ height: `${Math.max(12, point.value / 200)}px`, animationDelay: `${index * 60}ms` }} /><span>{point.month}</span></div>)}</div></div></section><section className="panel upcoming-panel"><div className="panel-head"><div><p className="eyebrow">The next few days</p><h2>Upcoming</h2></div><CalendarDays size={18} className="panel-icon" /></div><div className="upcoming-list">{dashboard.upcoming.map(item => <Link href={`/projects/${item.projectId}`} key={item.projectId} data-testid={`link-upcoming-${item.projectId}`} className="upcoming-row"><div className="date-block"><strong>{item.date.split(' ')[1]}</strong><small>{item.date.split(' ')[0]}</small></div><div className="upcoming-copy"><strong>{item.label}</strong><span>{item.projectName}</span></div><span className={cx('days-left', item.daysLeft < 7 && 'soon')}>{item.daysLeft}d</span></Link>)}</div></section></div>
    <div className="dashboard-lower reveal delay-3"><section className="panel projects-panel"><div className="panel-head"><div><p className="eyebrow">In motion</p><h2>Active projects</h2></div><Link href="/projects" data-testid="link-view-all-projects" className="text-link">View all <ArrowUpRight size={15} /></Link></div><div className="project-table">{dashboard.projects.filter(p => p.status !== 'Completed').map(project => <ProjectRow key={project.id} project={project} />)}</div></section><section className="panel activity-panel"><div className="panel-head"><div><p className="eyebrow">Live feed</p><h2>Recent activity</h2></div><MessageSquare size={18} className="panel-icon" /></div><ActivityList activities={dashboard.activity.slice(0, 4)} /></section></div>
  </AppShell>;
}

function WelcomePage() {
  return <div className="welcome-shell">
    <header className="welcome-nav">
      <Link href="/" className="brand"><div className="brand-mark"><Zap size={15} strokeWidth={3} /></div><span>studio<span>flow</span></span></Link>
      <div className="welcome-nav-actions"><Link href="/projects" className="text-link">Explore workspace <ArrowUpRight size={15} /></Link><Link href="/" className="button dark">Open dashboard</Link></div>
    </header>
    <main className="welcome-main">
      <section className="welcome-hero">
        <div className="welcome-copy reveal"><p className="eyebrow">A calmer way to run creative work</p><h1>From first brief<br /><em>to final yes.</em></h1><p className="welcome-lede">StudioFlow gives freelancers and small studios one thoughtful place to shape proposals, keep projects moving, and make client approvals feel easy.</p><div className="welcome-cta"><Link href="/" className="button primary"><Sparkles size={17} /> Start managing projects</Link><span><CheckCircle2 size={15} /> No setup required</span></div></div>
        <div className="welcome-preview reveal delay-1"><div className="preview-window"><div className="preview-window-top"><span /><span /><span /><small>studioflow / overview</small></div><div className="preview-window-body"><div className="preview-side"><div className="preview-logo"><Zap size={10} /></div><i /><i /><i /><i /></div><div className="preview-dashboard"><p>Tuesday, March 18, 2025</p><h3>Good morning, Alex <b>—</b></h3><div className="preview-stats"><span /><span /><span /></div><div className="preview-panels"><div><i /><i /><i /><i /></div><div><b /><b /><b /></div></div></div></div></div><div className="preview-note"><Sparkles size={15} /><span><strong>AI-assisted planning</strong><small>Brief in. Beautiful plan out.</small></span></div></div>
      </section>
      <section className="welcome-proof"><p className="eyebrow">Everything that keeps a studio moving</p><div className="proof-grid"><div><span className="proof-number">01</span><h2>Make a strong first impression.</h2><p>Turn a few honest notes into a polished proposal and three clear ways to work together.</p></div><div><span className="proof-number">02</span><h2>Keep the work in motion.</h2><p>Milestones, tasks, invoices, and client activity stay close enough to act on.</p></div><div><span className="proof-number">03</span><h2>Get to yes, more naturally.</h2><p>Give clients a considered portal where they can choose, approve, and leave useful notes.</p></div></div></section>
    </main>
    <footer className="welcome-footer"><span>StudioFlow</span><span>Built for independent studios with a lot of care.</span><Link href="/settings">Make it yours <ArrowUpRight size={14} /></Link></footer>
  </div>;
}

function ProjectRow({ project }: { project: Project }) {
  return <Link href={`/projects/${project.id}`} data-testid={`row-project-${project.id}`} className="project-row"><div className="project-accent" style={{ background: project.accent }} /><div className="project-client-avatar" style={{ background: `${project.accent}25`, color: project.accent }}>{project.initials}</div><div className="project-row-main"><strong>{project.name}</strong><span>{project.clientName} · {project.type}</span></div><div className="row-progress"><div className="progress-label"><span>{project.progress}%</span><small>complete</small></div><div className="progress-track"><i style={{ width: `${project.progress}%`, background: project.accent }} /></div></div><StatusPill status={project.status} /><ArrowUpRight size={16} className="row-arrow" /></Link>;
}

function ActivityList({ activities }: { activities: Activity[] }) {
  return <div className="activity-list">{activities.map(activity => <div className="activity-item" key={activity.id}><div className={cx('activity-dot', activity.type)}>{activity.type === 'approval' ? <Check size={13} /> : activity.type === 'file' ? <FileText size={13} /> : <Clock3 size={13} />}</div><div><p><strong>{activity.actor}</strong> {activity.action}</p><span>{activity.time}</span></div></div>)}</div>;
}

function ProjectsPage() {
  const query = useGetProjects();
  const archive = useArchiveProject();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All projects');
  const data = query.data ?? sampleProjects;
  const visible = data.filter(p => `${p.name} ${p.clientName}`.toLowerCase().includes(search.toLowerCase())).filter(p => filter === 'All projects' || p.status === filter);
  const doArchive = (e: MouseEvent, id: string) => { e.preventDefault(); if (window.confirm('Archive this project?')) archive.mutate({ id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetProjectsQueryKey() }) }); };
  return <AppShell><div className="page-head reveal"><div><p className="eyebrow">Your work, in one place</p><h1>Projects</h1><p className="lede">Keep every engagement moving with less admin.</p></div><Link href="/projects/new" data-testid="link-projects-new" className="button primary"><Plus size={17} /> New project</Link></div><div className="toolbar reveal delay-1"><div className="search-wrap"><Search size={17} /><input data-testid="input-project-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects or clients" /></div><select data-testid="select-project-filter" value={filter} onChange={e => setFilter(e.target.value)}><option>All projects</option><option>In progress</option><option>Proposal sent</option><option>Completed</option></select><button data-testid="button-project-sort" className="button outline">Recently updated <ChevronDown size={15} /></button></div><div className="project-list reveal delay-2">{query.isLoading ? [1, 2, 3].map(i => <Skeleton className="h-24" key={i} />) : visible.length ? visible.map(project => <div className="project-list-card" key={project.id}><ProjectRow project={project} /><button data-testid={`button-archive-${project.id}`} className="archive-button" title="Archive project" onClick={e => doArchive(e, project.id)}><Archive size={15} /></button></div>) : <div className="empty-state"><FolderOpen size={30} /><h3>No projects match that search</h3><p>Try another phrase or start a fresh engagement.</p><Link href="/projects/new" className="button outline">Create a project</Link></div>}</div></AppShell>;
}

function NewProjectPage() {
  const [, setLocation] = useLocation();
  const create = useCreateProject();
  const [form, setForm] = useState({ clientName: '', clientEmail: '', name: '', type: 'Brand identity', goals: '', budget: '', deadline: '', notes: '' });
  const [generating, setGenerating] = useState(false);
  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));
  const submit = (e: FormEvent) => { e.preventDefault(); setGenerating(true); create.mutate({ data: { ...form, budget: Number(form.budget) || 0 } }, { onSuccess: project => setLocation(`/projects/${project.id}`), onError: () => setTimeout(() => setGenerating(false), 900) }); };
  return <AppShell><div className="narrow-page"><Link href="/projects" data-testid="link-back-projects" className="back-link"><ArrowLeft size={16} /> All projects</Link><div className="page-head compact reveal"><div><p className="eyebrow">A new beginning</p><h1>Start a project</h1><p className="lede">Give StudioFlow the context. It’ll shape the first draft.</p></div><div className="ai-stamp"><Sparkles size={15} /> AI-assisted</div></div><form className="brief-form reveal delay-1" onSubmit={submit}><div className="form-section"><div className="form-section-title"><span>01</span><div><h2>The basics</h2><p>Who are you making this with?</p></div></div><div className="form-grid"><label>Client name<input data-testid="input-client-name" required value={form.clientName} onChange={e => update('clientName', e.target.value)} placeholder="e.g. Maya Chen" /></label><label>Client email<input data-testid="input-client-email" type="email" required value={form.clientEmail} onChange={e => update('clientEmail', e.target.value)} placeholder="maya@company.com" /></label><label className="span-2">Project name<input data-testid="input-project-name" required value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Northstar brand refresh" /></label><label>Project type<select data-testid="select-project-type" value={form.type} onChange={e => update('type', e.target.value)}><option>Brand identity</option><option>Web design</option><option>Creative direction</option><option>Packaging</option><option>Content system</option></select></label><label>Estimated budget<input data-testid="input-project-budget" type="number" required value={form.budget} onChange={e => update('budget', e.target.value)} placeholder="12800" /></label><label>Target deadline<input data-testid="input-project-deadline" type="date" required value={form.deadline} onChange={e => update('deadline', e.target.value)} /></label></div></div><div className="form-section"><div className="form-section-title"><span>02</span><div><h2>The brief</h2><p>What should the work make possible?</p></div></div><label>Goals and desired outcome<textarea data-testid="textarea-project-goals" required value={form.goals} onChange={e => update('goals', e.target.value)} placeholder="Tell us what success looks like. A few honest sentences are perfect." rows={5} /></label><label>Extra context <span className="optional">Optional</span><textarea data-testid="textarea-project-notes" value={form.notes} onChange={e => update('notes', e.target.value)} placeholder="Known constraints, references, preferences..." rows={4} /></label></div><div className="form-submit"><div><Sparkles size={18} /><span><strong>StudioFlow will draft your plan</strong><small>Proposal, packages, milestones and tasks — ready to edit.</small></span></div><button data-testid="button-create-project" className="button primary" disabled={generating || create.isPending}>{generating || create.isPending ? <><Loader2 size={17} className="spin" /> Building your plan…</> : <><Zap size={16} /> Create project</>}</button></div></form></div></AppShell>;
}

function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const query = useGetProject(id ?? '', { query: { enabled: !!id, queryKey: getGetProjectQueryKey(id ?? '') } });
  const fallback = sampleProjects.find(p => p.id === id) ?? sampleProjects[0];
  const project = query.data ?? sampleDetail(fallback);
  const [tab, setTab] = useState('Overview');
  const generate = useGenerateProjectPlan();
  const updateTask = useUpdateTask();
  const updateInvoice = useUpdateInvoice();
  const [generated, setGenerated] = useState(false);
  const [portalCopied, setPortalCopied] = useState(false);
  const tabs = ['Overview', 'Proposal', 'Timeline', 'Tasks', 'Invoices', 'Client activity'];
  const refresh = () => queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(id ?? '') });
  const toggleTask = (task: Task) => updateTask.mutate({ id: task.id, data: { status: task.status.toLowerCase() === 'done' ? 'todo' : 'done' } }, { onSuccess: refresh });
  const markInvoice = (invoice: Invoice) => updateInvoice.mutate({ id: invoice.id, data: { status: invoice.status === 'paid' ? 'sent' : 'paid' } }, { onSuccess: refresh });
  const doGenerate = () => { setGenerated(true); generate.mutate({ id: id ?? '' }, { onSuccess: () => { setGenerated(false); refresh(); }, onError: () => setTimeout(() => setGenerated(false), 1000) }); };
  const sharePortal = () => {
    navigator.clipboard?.writeText(`${window.location.origin}/portal/${project.shareToken ?? id}`);
    setPortalCopied(true);
    window.setTimeout(() => setPortalCopied(false), 1600);
  };
  return <AppShell><div className="workspace-head reveal"><div className="workspace-heading"><Link href="/projects" className="back-link" data-testid="link-workspace-back"><ArrowLeft size={16} /> Projects</Link><div className="project-title-row"><div className="project-big-avatar" style={{ background: `${project.accent}22`, color: project.accent }}>{project.initials}</div><div><div className="eyebrow">{project.type} <span className="dot-separator">·</span> {project.clientName}</div><h1>{project.name}</h1></div><StatusPill status={project.status} /></div></div><div className="workspace-actions"><button data-testid="button-share-project" className="button outline share-portal-button" onClick={sharePortal}>{portalCopied ? <Check size={15} /> : <Send size={15} />} {portalCopied ? 'Copied' : 'Share portal'}</button><button data-testid="button-workspace-more" className="icon-button"><MoreHorizontal size={18} /></button></div></div><div className="workspace-meta reveal delay-1"><span><CalendarDays size={15} /> Due {date(project.deadline)}</span><span><CircleDollarSign size={15} /> {money(project.budget)} project value</span><div className="workspace-progress"><span>{project.progress}% complete</span><div className="progress-track"><i style={{ width: `${project.progress}%`, background: project.accent }} /></div></div></div><div className="tabs reveal delay-1">{tabs.map(item => <button data-testid={`tab-${item.toLowerCase().replaceAll(' ', '-')}`} key={item} className={cx(tab === item && 'active')} onClick={() => setTab(item)}>{item}{item === 'Tasks' && <em>{project.tasks.length}</em>}</button>)}</div><div className="workspace-content reveal delay-2">{query.isLoading ? <div className="workspace-loading"><Skeleton className="h-52" /><Skeleton className="h-52" /></div> : tab === 'Overview' ? <OverviewTab project={project} onGenerate={doGenerate} generating={generated || generate.isPending} /> : tab === 'Proposal' ? <ProposalTab project={project} /> : tab === 'Timeline' ? <TimelineTab milestones={project.milestones} /> : tab === 'Tasks' ? <TasksTab tasks={project.tasks} onToggle={toggleTask} /> : tab === 'Invoices' ? <InvoicesTab invoices={project.invoices} onMark={markInvoice} /> : <ActivityList activities={project.activities} />}</div></AppShell>;
}

function OverviewTab({ project, onGenerate, generating }: { project: ProjectDetail; onGenerate: () => void; generating: boolean }) {
  return <div className="overview-layout"><div className="overview-main"><section className="panel intro-panel"><div className="intro-top"><div><p className="eyebrow">The brief</p><h2>{project.goals}</h2></div><Target size={25} /></div><p className="body-copy">{project.notes}</p></section><section className="panel next-panel"><div className="panel-head"><div><p className="eyebrow">Keep it moving</p><h2>Next up</h2></div><span className="next-count">{project.tasks.filter(t => t.status.toLowerCase() !== 'done').length} open</span></div>{project.tasks.filter(t => t.status.toLowerCase() !== 'done').slice(0, 3).map(task => <div className="next-task" key={task.id}><div className="task-check" /><div><strong>{task.title}</strong><span>{task.phase} · due {date(task.dueDate)}</span></div><ArrowUpRight size={15} /></div>)}</section></div><div className="overview-side"><section className="panel plan-card"><div className="plan-glow" /><Sparkles size={21} /><h3>Make the busywork disappear.</h3><p>Generate a polished proposal, packages, milestones, and tasks from the brief.</p><button data-testid="button-generate-plan" className="button dark" onClick={onGenerate} disabled={generating}>{generating ? <><Loader2 size={16} className="spin" /> Thinking through it…</> : <><Sparkles size={16} /> Generate project plan</>}</button></section><section className="panel mini-activity"><div className="panel-head"><h2>Recent activity</h2><Clock3 size={16} /></div><ActivityList activities={project.activities.slice(0, 3)} /></section></div></div>;
}

function ProposalTab({ project }: { project: ProjectDetail }) {
  const [selected, setSelected] = useState(project.proposal.selectedPackage ?? 'signature');
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard?.writeText(`${window.location.origin}/portal/${project.shareToken ?? project.id}`); setCopied(true); setTimeout(() => setCopied(false), 1400); };
  return <div className="proposal-layout"><section className="proposal-copy panel"><div className="proposal-status"><StatusPill status={project.proposal.status} /><span>Last edited just now</span></div><p className="eyebrow">Proposal headline</p><h2>{project.proposal.headline}</h2><p className="proposal-body">{project.proposal.body}</p><div className="proposal-rule" /><p className="eyebrow">Client-facing portal</p><div className="share-box"><div><strong>Ready to share</strong><span>Clients can choose a package and approve online.</span></div><button data-testid="button-copy-portal-link" className="button outline" onClick={copy}>{copied ? <><Check size={15} /> Copied</> : <><Copy size={15} /> Copy link</>}</button></div></section><section className="packages"><div className="section-heading"><div><p className="eyebrow">Your recommendation</p><h2>Package options</h2></div><span className="muted-note">Select a default</span></div>{project.packages.map(pkg => <PackageCard key={pkg.id} pkg={pkg} selected={selected === pkg.id} onSelect={() => setSelected(pkg.id)} />)}</section></div>;
}
function PackageCard({ pkg, selected, onSelect }: { pkg: Package; selected: boolean; onSelect: () => void }) { return <button data-testid={`button-package-${pkg.id}`} className={cx('package-card', selected && 'selected')} onClick={onSelect}><div className="package-card-top"><div><span className="package-name">{pkg.name}</span>{pkg.recommended && <span className="recommended">Recommended</span>}</div><strong>{money(pkg.price)}</strong></div><p>{pkg.description}</p><ul>{pkg.features.map(feature => <li key={feature}><Check size={14} /> {feature}</li>)}</ul><div className={cx('radio', selected && 'checked')}>{selected && <i />}</div></button>; }

function TimelineTab({ milestones }: { milestones: Milestone[] }) { return <section className="panel timeline-panel"><div className="panel-head"><div><p className="eyebrow">A clear path forward</p><h2>Project timeline</h2></div><button data-testid="button-timeline-filter" className="select-button">All milestones <ChevronDown size={14} /></button></div><div className="timeline">{milestones.map((milestone, i) => <div className={cx('milestone', milestone.status)} key={milestone.id}><div className="milestone-line"><div className="milestone-dot">{milestone.status === 'complete' ? <Check size={13} /> : i + 1}</div>{i < milestones.length - 1 && <div className="line" />}</div><div className="milestone-copy"><span>{milestone.status === 'current' ? 'In the studio now' : milestone.status === 'complete' ? 'Complete' : 'Coming up'}</span><h3>{milestone.name}</h3><p>{date(milestone.date)}</p></div></div>)}</div></section>; }
function TasksTab({ tasks, onToggle }: { tasks: Task[]; onToggle: (task: Task) => void }) { return <section className="panel tasks-panel"><div className="panel-head"><div><p className="eyebrow">Small steps, big picture</p><h2>Tasks</h2></div><button data-testid="button-add-task" className="button outline"><Plus size={15} /> Add task</button></div><div className="task-table">{tasks.map(task => <div className="task-row" key={task.id}><button data-testid={`button-task-${task.id}`} className={cx('task-check', task.status === 'done' && 'done')} onClick={() => onToggle(task)}>{task.status === 'done' && <Check size={13} />}</button><div className={cx('task-title', task.status === 'done' && 'completed')}><strong>{task.title}</strong><span>{task.phase}</span></div><span className="task-assignee">{task.assignee}</span><span className="task-due">{date(task.dueDate)}</span><StatusPill status={task.status} /><button className="icon-button tiny" data-testid={`button-task-more-${task.id}`}><MoreHorizontal size={15} /></button></div>)}</div></section>; }
function TasksTab({ tasks, onToggle }: { tasks: Task[]; onToggle: (task: Task) => void }) { return <section className="panel tasks-panel"><div className="panel-head"><div><p className="eyebrow">Small steps, big picture</p><h2>Tasks</h2></div><button data-testid="button-add-task" className="button outline"><Plus size={15} /> Add task</button></div><div className="task-table">{tasks.map(task => { const isDone = task.status.toLowerCase() === 'done'; return <div className="task-row" key={task.id}><button data-testid={`button-task-${task.id}`} className={cx('task-check', isDone && 'done')} onClick={() => onToggle(task)}>{isDone && <Check size={13} />}</button><div className={cx('task-title', isDone && 'completed')}><strong>{task.title}</strong><span>{task.phase}</span></div><span className="task-assignee">{task.assignee}</span><span className="task-due">{date(task.dueDate)}</span><StatusPill status={task.status} /><button className="icon-button tiny" data-testid={`button-task-more-${task.id}`}><MoreHorizontal size={15} /></button></div>; })}</div></section>; }
function InvoicesTab({ invoices, onMark }: { invoices: Invoice[]; onMark: (invoice: Invoice) => void }) { return <section className="panel invoices-panel"><div className="panel-head"><div><p className="eyebrow">Money, without the awkwardness</p><h2>Invoices</h2></div><button data-testid="button-new-invoice" className="button outline"><Plus size={15} /> New invoice</button></div><div className="invoice-summary"><div><span>Invoiced</span><strong>{money(invoices.reduce((sum, i) => sum + i.amount, 0))}</strong></div><div><span>Paid</span><strong>{money(invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0))}</strong></div><div><span>Remaining</span><strong>{money(invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.amount, 0))}</strong></div></div><div className="invoice-table">{invoices.map(invoice => <div className="invoice-row" key={invoice.id}><div className="invoice-icon"><ReceiptText size={17} /></div><div><strong>{invoice.number}</strong><span>{invoice.description}</span></div><strong className="invoice-amount">{money(invoice.amount)}</strong><span className="task-due">Due {date(invoice.dueDate)}</span><StatusPill status={invoice.status} /><button data-testid={`button-invoice-${invoice.id}`} className="button tiny-outline" onClick={() => onMark(invoice)}>{invoice.status === 'paid' ? 'Mark sent' : 'Mark paid'}</button></div>)}</div></section>; }

function PortalPage() {
  const { token } = useParams<{ token: string }>();
  const query = useGetClientPortal(token ?? '', { query: { enabled: !!token, queryKey: getGetClientPortalQueryKey(token ?? '') } });
  const fallback = sampleProjects.find(p => p.shareToken === token) ?? sampleProjects[0];
  const project = query.data ?? sampleDetail(fallback);
  const approve = useApproveProposal();
  const request = useRequestProposalChanges();
  const [selected, setSelected] = useState(project.proposal.selectedPackage ?? 'signature');
  const [note, setNote] = useState('');
  const [decision, setDecision] = useState('');
  const submit = (kind: 'approve' | 'changes') => { const mutation = kind === 'approve' ? approve : request; mutation.mutate({ id: project.id, data: { packageId: selected, note } }, { onSuccess: () => setDecision(kind), onError: () => setDecision(kind) }); };
  return <div className="portal-shell"><header className="portal-header"><Link href="/" className="brand portal-brand"><div className="brand-mark"><Zap size={15} strokeWidth={3} /></div><span>studio<span>flow</span></span></Link><div className="portal-by">A proposal from <strong>Alex Lee</strong><span className="portal-avatar">AL</span></div></header><main className="portal-main">{decision ? <div className="portal-success"><div className="success-mark"><Check size={27} /></div><p className="eyebrow">{decision === 'approve' ? 'We’re on' : 'Back to the studio'}</p><h1>{decision === 'approve' ? 'A great choice.' : 'Notes received.'}</h1><p>{decision === 'approve' ? 'Alex has been notified and will be in touch with the next step shortly.' : 'Alex has your notes and will come back with a considered update.'}</p><button data-testid="button-portal-return" className="button dark" onClick={() => setDecision('')}>Review proposal again</button></div> : <><div className="portal-hero"><p className="eyebrow">A proposal for {project.clientName}</p><h1>{project.proposal.headline}</h1><p>{project.proposal.body}</p><div className="portal-meta"><span><CalendarDays size={15} /> Target delivery {date(project.deadline)}</span><span><Users size={15} /> Prepared by Alex Lee</span></div></div><section className="portal-section"><div className="portal-section-heading"><div><p className="eyebrow">Choose what fits</p><h2>Ways we can work together</h2></div><span>All prices in USD</span></div><div className="portal-packages">{project.packages.map(pkg => <PackageCard key={pkg.id} pkg={pkg} selected={selected === pkg.id} onSelect={() => setSelected(pkg.id)} />)}</div></section><section className="portal-bottom"><div><p className="eyebrow">Once we’re aligned</p><h2>A thoughtful process, with room to think.</h2><div className="portal-timeline">{project.milestones.map(m => <div key={m.id}><span>{date(m.date)}</span><strong>{m.name}</strong></div>)}</div></div><div className="portal-decision"><p className="eyebrow">Ready when you are</p><h3>What do you think?</h3><textarea data-testid="textarea-portal-note" value={note} onChange={e => setNote(e.target.value)} placeholder="A note for Alex (optional)" /><button data-testid="button-approve-proposal" className="button dark full" disabled={approve.isPending} onClick={() => submit('approve')}><CheckCircle2 size={17} /> Approve {project.packages.find(p => p.id === selected)?.name}</button><button data-testid="button-request-changes" className="button text-button full" onClick={() => submit('changes')}>I’d like to request changes</button></div></section></>}</main><footer className="portal-footer">StudioFlow <span>·</span> A calmer way to run creative work.</footer></div>;
}

function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [theme, setTheme] = useState('warm');
  const profile = useStudioProfile();
  const [form, setForm] = useState<StudioProfile>(profile);
  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));
  const save = (e: FormEvent) => { e.preventDefault(); saveStudioProfile(form); setSaved(true); setTimeout(() => setSaved(false), 1800); };
  return <AppShell><div className="page-head reveal"><div><p className="eyebrow">Your space, your rules</p><h1>Settings</h1><p className="lede">Shape how your studio shows up.</p></div>{saved && <span className="saved-note"><Check size={15} /> Saved</span>}</div><form className="settings-grid reveal delay-1" onSubmit={save}><section className="panel settings-section"><div className="settings-heading"><div className="settings-icon"><Users size={18} /></div><div><h2>Freelancer profile</h2><p>This appears on client-facing proposals.</p></div></div><div className="settings-fields"><label>Full name<input data-testid="input-settings-name" value={form.name} onChange={e => update('name', e.target.value)} /></label><label>Studio name<input data-testid="input-settings-studio" value={form.studio} onChange={e => update('studio', e.target.value)} /></label><label>Email address<input data-testid="input-settings-email" type="email" value={form.email} onChange={e => update('email', e.target.value)} /></label><label className="span-2">Short bio<textarea data-testid="textarea-settings-bio" rows={3} value={form.bio} onChange={e => update('bio', e.target.value)} /></label></div></section><section className="panel settings-section"><div className="settings-heading"><div className="settings-icon amber"><Palette size={18} /></div><div><h2>Brand & appearance</h2><p>A little personality goes a long way.</p></div></div><div className="theme-choices">{[['warm', 'Warm paper', '#f4f0e8'], ['sage', 'Quiet sage', '#e7eee7'], ['ink', 'Ink & cream', '#20373b']].map(([value, label, color]) => <button type="button" data-testid={`button-theme-${value}`} key={value} className={cx('theme-choice', theme === value && 'selected')} onClick={() => setTheme(value)}><span style={{ background: color }} /><strong>{label}</strong>{theme === value && <Check size={15} />}</button>)}</div></section><section className="panel settings-section"><div className="settings-heading"><div className="settings-icon green"><CircleDollarSign size={18} /></div><div><h2>Payments</h2><p>Defaults for your invoices and deposits.</p></div></div><div className="payment-row"><div><strong>USD · United States Dollar</strong><span>Default currency</span></div><CheckCircle2 size={19} /></div><div className="payment-row"><div><strong>40% deposit</strong><span>Suggested for new projects</span></div><ChevronDown size={17} /></div></section><div className="settings-save"><span>Changes are saved to this workspace.</span><button data-testid="button-save-settings" className="button primary" type="submit">Save changes</button></div></form></AppShell>;
}

function Router() {
  return <ErrorBoundary><Switch><Route path="/" component={DashboardPage} /><Route path="/welcome" component={WelcomePage} /><Route path="/projects" component={ProjectsPage} /><Route path="/projects/new" component={NewProjectPage} /><Route path="/projects/:id" component={ProjectPage} /><Route path="/portal/:token" component={PortalPage} /><Route path="/settings" component={SettingsPage} /><Route component={NotFound} /></Switch></ErrorBoundary>;
}
function App() { return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>; }
export default App;