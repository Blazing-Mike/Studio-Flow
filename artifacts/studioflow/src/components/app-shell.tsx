import { useGetProjects } from "@workspace/api-client-react";
import {
  profileInitials,
  useStudioProfile,
} from "@/hooks/use-studio-profile";
import { cx } from "@/lib/format";
import {
  Bell,
  BriefcaseBusiness,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Send,
  Settings2,
  Zap,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, type ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
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
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
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
      <main className="main-area" id="main-content" tabIndex={-1}>
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
              aria-label="Search projects"
              onClick={() => navigate("/projects")}
            >
              <Search size={18} />
            </button>
            <button
              data-testid="button-notifications"
              className="icon-button notification"
              title="You're all caught up"
              aria-label="Notifications"
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

