import { useEffect, useCallback } from "react";
import { Hexagon } from "lucide-react";
import { ConfigPanel } from "@/components/builder/ConfigPanel";
import { PreviewPanel } from "@/components/builder/PreviewPanel";
import { SavedAgentsGrid } from "@/components/builder/SavedAgentsGrid";
import { Separator } from "@/components/ui/separator";
// import { useDraftStore } from "@/store/agentStore";
import type { AgentData } from "@/types";
import { useDraftStore } from "./store/agentStore";

export default function App() {
  const setData = useDraftStore((s) => s.setData);
  const setLoading = useDraftStore((s) => s.setLoading);
  const setError = useDraftStore((s) => s.setError);
  const agentName = useDraftStore((s) => s.agentName);

  const fetchAPI = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const delay = Math.floor(Math.random() * 2000) + 1000;
      await new Promise((r) => setTimeout(r, delay));
      const res = await fetch("/data.json");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: AgentData = await res.json();
      setData(json);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [setData, setLoading, setError]);

  useEffect(() => {
    fetchAPI();
  }, [fetchAPI]);

  // BUG FIX: agentName in deps so interval always has fresh value
  useEffect(() => {
    const interval = setInterval(() => {
      console.log(
        agentName
          ? `[Analytics] Draft: "${agentName}"`
          : "[Analytics] Unnamed draft in progress",
      );
    }, 8000);
    return () => clearInterval(interval);
  }, [agentName]);

  return (
    <div className="flex min-h-screen flex-col bg-[hsl(var(--background))]">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--card)/0.8)] px-6 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Hexagon
            size={26}
            className="text-[hsl(var(--primary))] drop-shadow-[0_0_8px_hsl(var(--primary)/0.6)]"
            strokeWidth={1.5}
          />
          <div>
            <h1 className="text-lg font-bold tracking-tight leading-none text-emerald-600">
              Agent Builder
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))] mt-0.5">
              Compose intelligent AI profiles
            </p>
          </div>
        </div>
        <div
          className="absolute inset-0 -z-10 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,hsl(214 100% 65%) 0,hsl(214 100% 65%) 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,hsl(214 100% 65%) 0,hsl(214 100% 65%) 1px,transparent 1px,transparent 40px)",
          }}
        />
      </header>

      <main className="flex flex-1 flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="flex flex-col min-h-[520px]">
            <ConfigPanel onReload={fetchAPI} />
          </div>
          <div className="flex flex-col min-h-[520px]">
            <PreviewPanel />
          </div>
        </div>
        <Separator />
        <SavedAgentsGrid />
      </main>

      <footer className="border-t border-[hsl(var(--border))] px-6 py-3 text-center">
        <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
          AI Agent Profile Builder · Vivasoft Nepal Frontend Challenge
        </p>
      </footer>
    </div>
  );
}
