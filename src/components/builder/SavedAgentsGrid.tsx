import { useMemo } from "react";
import { Trash2, Upload, Bot, Layers, Zap, BrainCircuit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SavedAgent } from "@/types";
import { cn } from "@/lib/utils";
import { useDraftStore, useSavedStore } from "@/store/agentStore";
import { Separator } from "../ui/separator";

const PROVIDER_COLORS: Record<string, string> = {
  Claude:
    "bg-[hsl(var(--amber)/0.12)] text-[hsl(var(--amber))] border-[hsl(var(--amber)/0.3)]",
  ChatGPT:
    "bg-[hsl(var(--green)/0.12)] text-[hsl(var(--green))] border-[hsl(var(--green)/0.3)]",
  Gemini:
    "bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))] border-[hsl(var(--primary)/0.3)]",
  DeepSeek:
    "bg-[hsl(var(--purple)/0.12)] text-[hsl(var(--purple))] border-[hsl(var(--purple)/0.3)]",
  Kimi: "bg-[hsl(var(--destructive)/0.12)] text-[hsl(var(--destructive))] border-[hsl(var(--destructive)/0.3)]",
};

function AgentCard({ agent }: { agent: SavedAgent }) {
  const data = useDraftStore((s) => s.data);
  const loadAgent = useDraftStore((s) => s.loadAgent);
  const deleteAgent = useSavedStore((s) => s.deleteAgent);

  const profileName = useMemo(
    () =>
      data?.agentProfiles.find((p) => p.id === agent.profileId)?.name ?? "—",
    [data, agent.profileId],
  );

  const initial = agent.name.charAt(0).toUpperCase();

  return (
    <Card className="flex flex-col gap-0 overflow-hidden transition-all duration-200 hover:border-[hsl(var(--border-light,var(--border)))] hover:shadow-lg hover:shadow-black/20">
      {/* Avatar strip */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.12)] border border-[hsl(var(--primary)/0.25)] text-[hsl(var(--primary))] font-bold text-base select-none">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-sm leading-tight">
            {agent.name}
          </p>
          {agent.provider ? (
            <span
              className={cn(
                "mt-0.5 inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold",
                PROVIDER_COLORS[agent.provider] ??
                  "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] border-[hsl(var(--border))]",
              )}
            >
              {agent.provider}
            </span>
          ) : (
            <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
              No provider
            </span>
          )}
        </div>
      </div>

      <CardContent className="px-4 pb-4 pt-0 flex flex-col gap-3">
        {/* Meta grid */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: BrainCircuit, label: "Profile", value: profileName },
            {
              icon: Zap,
              label: "Skills",
              value: String(agent.skillIds.length),
            },
            {
              icon: Layers,
              label: "Layers",
              value: String(agent.layerIds.length),
            },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-0.5 rounded-lg bg-[hsl(var(--muted))] py-2 px-1 text-center"
            >
              <Icon size={12} className="text-[hsl(var(--muted-foreground))]" />
              <span className="text-[9px] uppercase tracking-wider text-[hsl(var(--muted-foreground))] font-semibold">
                {label}
              </span>
              <span className="text-xs font-semibold truncate w-full text-center">
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Created at */}
        <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
          {new Date(agent.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <Button
            variant="accent"
            size="sm"
            className="flex-1 gap-1.5 text-xs"
            onClick={() => loadAgent(agent)}
          >
            <Upload size={12} />
            Load
          </Button>
          <Button
            variant="destructive"
            size="icon"
            className="shrink-0"
            onClick={() => deleteAgent(agent.id)}
            aria-label="Delete agent"
          >
            <Trash2 size={13} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function SavedAgentsGrid() {
  const savedAgents = useSavedStore((s) => s.savedAgents);
  const clearAll = useSavedStore((s) => s.clearAll);

  if (savedAgents.length === 0) return null;

  return (
    <>
      <Separator />
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot size={18} className="text-[hsl(var(--primary))]" />
            <h2 className="text-[hsl(var(--secondary-foreground))] font-bold text-base tracking-tight">
              Saved Agents
            </h2>
            <Badge>{savedAgents.length}</Badge>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (confirm("Clear all saved agents?")) clearAll();
            }}
            className="text-xs gap-1.5"
          >
            <Trash2 size={12} />
            Clear all
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {savedAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </section>
    </>
  );
}
