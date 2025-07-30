import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import WriterPage from "@/pages/writer";
import ProjectLibrary from "@/pages/project-library";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={ProjectLibrary} />
      <Route path="/projects" component={ProjectLibrary} />
      <Route path="/writer" component={WriterPage} />
      <Route path="/writer/:projectId" component={WriterPage} />
      <Route path="/writer/:projectId/:chapterId" component={WriterPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
