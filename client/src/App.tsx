import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Pantry from "@/pages/pantry";
import Recipes from "@/pages/recipes";
import Scan from "@/pages/scan";
import Sidebar from "@/components/layout/sidebar";

function Router() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-6">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/pantry" component={Pantry} />
          <Route path="/recipes" component={Recipes} />
          <Route path="/scan" component={Scan} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
