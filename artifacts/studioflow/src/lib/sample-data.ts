import type {
  Activity,
  Dashboard,
  Project,
  ProjectDetail,
} from "@workspace/api-client-react";
import { projects as demoProjects } from "@workspace/demo-data";

/**
 * Client-side fallback data, derived from the shared demo workspace
 * (@workspace/demo-data) that also seeds the server. The app renders the same
 * content with or without the API — no more drift between the two.
 */

export const sampleProjects: Project[] = demoProjects;

export const sampleActivities: Activity[] = demoProjects.flatMap(
  (p) => p.activities,
);

const daysLeft = (date: string) =>
  Math.max(0, Math.round((new Date(date).getTime() - Date.now()) / 86_400_000));

export const sampleDashboard: Dashboard = {
  revenue: demoProjects.reduce((sum, p) => sum + p.budget, 0),
  revenueChange: 12.8,
  activeProjects: demoProjects.filter((p) => p.status === "In progress").length,
  outstanding: demoProjects
    .flatMap((p) => p.invoices)
    .filter((i) => i.status === "Outstanding" || i.status === "Sent")
    .reduce((sum, i) => sum + i.amount, 0),
  outstandingCount: demoProjects
    .flatMap((p) => p.invoices)
    .filter((i) => i.status === "Outstanding" || i.status === "Sent").length,
  upcoming: demoProjects
    .flatMap((p) =>
      p.milestones
        .filter((m) => m.status === "current" || m.status === "upcoming")
        .map((m) => ({
          projectId: p.id,
          projectName: p.name,
          clientName: p.clientName,
          label: m.name,
          date: m.date,
          daysLeft: daysLeft(m.date),
        })),
    )
    .slice(0, 5),
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

export const sampleDetail = (project: Project): ProjectDetail => {
  const full = demoProjects.find((p) => p.id === project.id);
  return (full ?? demoProjects[0]) as ProjectDetail;
};
