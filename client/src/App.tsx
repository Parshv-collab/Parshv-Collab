import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

const Admin = lazy(() => import("./pages/Admin"));
const WritingIndex = lazy(() => import("./pages/Writing").then(module => ({ default: module.WritingIndex })));
const WritingArticle = lazy(() => import("./pages/Writing").then(module => ({ default: module.WritingArticle })));

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/writing/:slug"}>{() => <Suspense fallback={<div className="min-h-screen bg-[#09090b]" />}><WritingArticle /></Suspense>}</Route>
      <Route path={"/writing"}>{() => <Suspense fallback={<div className="min-h-screen bg-[#09090b]" />}><WritingIndex /></Suspense>}</Route>
      <Route path={"/"} component={Home} />
      <Route path={"/admin"}>{() => <Suspense fallback={<div className="min-h-screen bg-[#09090b]" />}><Admin /></Suspense>}</Route>
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
