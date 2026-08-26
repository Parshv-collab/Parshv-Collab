import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#09090b] bg-[radial-gradient(circle_at_50%_0%,rgba(180,255,74,0.12),transparent_38%)] px-4 text-white">
      <Card className="w-full max-w-lg border border-white/10 bg-[#111113]/95 shadow-2xl shadow-black/40 backdrop-blur-sm">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[#b4ff4a]/15 motion-safe:animate-pulse" />
              <AlertCircle className="relative h-16 w-16 text-[#b4ff4a]" />
            </div>
          </div>

          <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-[#b4ff4a]">Signal unavailable</p>
          <h1 className="mb-2 text-4xl font-bold text-white">404</h1>

          <h2 className="mb-4 text-xl font-semibold text-white/90">
            Page Not Found
          </h2>

          <p className="mb-8 leading-relaxed text-white/60">
            Sorry, the page you are looking for doesn't exist.
            <br />
            It may have been moved or deleted.
          </p>

          <div
            id="not-found-button-group"
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Button
              onClick={handleGoHome}
              className="bg-[#b4ff4a] px-6 py-2.5 text-black hover:bg-[#c5ff6e] focus-visible:ring-[#b4ff4a]"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
