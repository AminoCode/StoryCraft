import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import WriterPage from "@/pages/writer";
import ProjectLibrary from "@/pages/project-library";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={ProjectLibrary} />
          <Route path="/projects" component={ProjectLibrary} />
          <Route path="/writer" component={WriterPage} />
          <Route path="/writer/:projectId" component={WriterPage} />
          <Route path="/writer/:projectId/:chapterId" component={WriterPage} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
