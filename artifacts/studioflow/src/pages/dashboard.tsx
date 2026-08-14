import { AppShell } from "@/components/app-shell";
import { ActivityList, ProjectRow, Skeleton, StatCard } from "@/components/shared";
import { usePageTitle } from "@/hooks/use-page-title";
import { useStudioProfile } from "@/hooks/use-studio-profile";
import { useGetDashboard } from "@workspace/api-client-react";
import { cx, dateParts, money } from "@/lib/format";
import { sampleDashboard } from "@/lib/sample-data";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  FolderOpen,
  Gauge,
  MessageSquare,
  Plus,
  ReceiptText,
} from "lucide-react";
import { Link } from "wouter";

export function DashboardPage() {
  usePageTitle("Overview");
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

