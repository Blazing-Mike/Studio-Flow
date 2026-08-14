import type { Activity, Package, Project } from "@workspace/api-client-react";
import { cx, money } from "@/lib/format";
import {
  ArrowUpRight,
  Check,
  Clock3,
  FileText,
  Gauge,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { Link } from "wouter";

export function StatusPill({ status }: { status: string }) {
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

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={cx("skeleton", className)} />;
}

export function StatCard({
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

export function ProjectRow({ project }: { project: Project }) {
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

export function ActivityList({ activities }: { activities: Activity[] }) {
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

export function PackageCard({
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

