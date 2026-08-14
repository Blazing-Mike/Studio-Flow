import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getStoredTheme } from "@/hooks/use-theme";
import { queryClient } from "@/lib/query-client";
import NotFound from "@/pages/not-found";
import { QueryClientProvider } from "@tanstack/react-query";
import { Loader2, Zap } from "lucide-react";
import { lazy, Suspense, useEffect } from "react";
import { Route, Router as WouterRouter, Switch } from "wouter";
import "./index.css";

// Route-level code splitting: each page loads its own chunk on first visit.
const DashboardPage = lazy(() =>
  import("@/pages/dashboard").then((m) => ({ default: m.DashboardPage })),
);
const WelcomePage = lazy(() =>
  import("@/pages/welcome").then((m) => ({ default: m.WelcomePage })),
);
const ProjectsPage = lazy(() =>
  import("@/pages/projects").then((m) => ({ default: m.ProjectsPage })),
);
const NewProjectPage = lazy(() =>
  import("@/pages/projects").then((m) => ({ default: m.NewProjectPage })),
);
const ProjectPage = lazy(() =>
  import("@/pages/project").then((m) => ({ default: m.ProjectPage })),
);
const PortalPage = lazy(() =>
  import("@/pages/portal").then((m) => ({ default: m.PortalPage })),
);
const ProposalsPage = lazy(() =>
  import("@/pages/proposals").then((m) => ({ default: m.ProposalsPage })),
);
const SettingsPage = lazy(() =>
  import("@/pages/settings").then((m) => ({ default: m.SettingsPage })),
);

function PageLoader() {
  return (
    <div className="page-loader">
      <div className="brand-mark">
        <Zap size={15} strokeWidth={3} />
      </div>
      <span>
        studio<span>flow</span>
      </span>
      <Loader2 size={18} className="spin" />
    </div>
  );
}

function Router() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
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
      </Suspense>
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
