import { useMemo } from "react";
import { RefreshCw, Loader2, ChevronDown } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PROVIDERS } from "@/types";
import { cn } from "@/lib/utils";
import { useDraftStore } from "@/store/agentStore";

interface ConfigPanelProps {
  onReload: () => void;
}

// Tiny wrapper that keeps the native select styled consistently
function StyledSelect({
  id,
  value,
  onChange,
  children,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full appearance-none rounded-[var(--radius)] border border-[hsl(var(--border))]",
          "bg-[hsl(var(--input))] px-3 py-2 pr-9 text-sm text-[hsl(var(--foreground))]",
          "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]",
          "transition-colors cursor-pointer",
        )}
      >
        {children}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
      />
    </div>
  );
}

// A select that resets to "" after each pick (for additive multi-select)
function AdditiveSelect({
  id,
  placeholder,
  options,
  selected,
  onAdd,
}: {
  id: string;
  placeholder: string;
  options: { value: string; label: string }[];
  selected: string[];
  onAdd: (id: string) => void;
}) {
  const available = options.filter((o) => !selected.includes(o.value));

  return (
    <div className="relative">
      <select
        id={id}
        value=""
        onChange={(e) => {
          if (e.target.value) onAdd(e.target.value);
          e.target.value = "";
        }}
        className={cn(
          "w-full appearance-none rounded-[var(--radius)] border border-[hsl(var(--border))]",
          "bg-[hsl(var(--input))] px-3 py-2 pr-9 text-sm",
          "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]",
          "transition-colors cursor-pointer",
          available.length === 0
            ? "text-[hsl(var(--muted-foreground))] opacity-60"
            : "text-[hsl(var(--foreground))]",
        )}
        disabled={available.length === 0}
      >
        <option value="" disabled>
          {available.length === 0 ? "All added" : placeholder}
        </option>
        {available.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
      />
    </div>
  );
}

export function ConfigPanel({ onReload }: ConfigPanelProps) {
  const data = useDraftStore((s) => s.data);
  const loading = useDraftStore((s) => s.loading);
  const error = useDraftStore((s) => s.error);
  const selectedProfile = useDraftStore((s) => s.selectedProfile);
  const selectedSkills = useDraftStore((s) => s.selectedSkills);
  const selectedLayers = useDraftStore((s) => s.selectedLayers);
  const selectedProvider = useDraftStore((s) => s.selectedProvider);

  const setSelectedProfile = useDraftStore((s) => s.setSelectedProfile);
  const addSkill = useDraftStore((s) => s.addSkill);
  const addLayer = useDraftStore((s) => s.addLayer);
  const setSelectedProvider = useDraftStore((s) => s.setSelectedProvider);

  const selectedProfileObj = useMemo(
    () => data?.agentProfiles.find((p) => p.id === selectedProfile) ?? null,
    [data, selectedProfile],
  );

  const skillOptions = useMemo(
    () =>
      data?.skills.map((s) => ({
        value: s.id,
        label: `${s.name} · ${s.category}`,
      })) ?? [],
    [data],
  );

  const layerOptions = useMemo(
    () =>
      data?.layers.map((l) => ({
        value: l.id,
        label: `${l.name} · ${l.type}`,
      })) ?? [],
    [data],
  );

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold tracking-tight">
            Configuration
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onReload}
            disabled={loading}
            className="gap-1.5 text-xs"
          >
            {loading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <RefreshCw size={13} />
            )}
            {loading ? "Loading…" : "Reload"}
          </Button>
        </div>

        {loading && (
          <div className="mt-3 flex items-center gap-2 rounded-md bg-[hsl(var(--primary)/0.08)] border border-[hsl(var(--primary)/0.2)] px-3 py-2">
            <Loader2
              size={13}
              className="animate-spin text-[hsl(var(--primary))]"
            />
            <span className="text-xs text-[hsl(var(--primary))]">
              Fetching configuration data…
            </span>
          </div>
        )}

        {error && (
          <div className="mt-3 flex items-center justify-between rounded-md bg-[hsl(var(--destructive)/0.1)] border border-[hsl(var(--destructive)/0.25)] px-3 py-2">
            <span className="text-xs text-[hsl(var(--destructive))]">
              ⚠ {error}
            </span>
            <button
              onClick={onReload}
              className="text-xs text-[hsl(var(--destructive))] underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        )}
      </CardHeader>

      <Separator />

      <CardContent className="flex flex-col gap-5 pt-5 flex-1 overflow-y-auto">
        {!data && !loading && !error && (
          <p className="text-sm text-[hsl(var(--muted-foreground))] italic text-center py-8">
            No data loaded yet.
          </p>
        )}

        {data && (
          <>
            {/* Base Profile */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[hsl(var(--primary))] shadow-[0_0_6px_hsl(var(--primary))]" />
                <Label htmlFor="profile-select">Base Profile</Label>
              </div>
              <StyledSelect
                id="profile-select"
                value={selectedProfile}
                onChange={setSelectedProfile}
              >
                <option value="">— Choose a profile —</option>
                {data.agentProfiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </StyledSelect>
              {selectedProfileObj && (
                <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed pl-4 border-l-2 border-[hsl(var(--primary)/0.4)]">
                  {selectedProfileObj.description}
                </p>
              )}
            </div>

            {/* Skills */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[hsl(var(--green))] shadow-[0_0_6px_hsl(var(--green))]" />
                <Label htmlFor="skill-select">Add Skill</Label>
                {selectedSkills.length > 0 && (
                  <Badge variant="green" className="ml-auto">
                    {selectedSkills.length}
                  </Badge>
                )}
              </div>
              <AdditiveSelect
                id="skill-select"
                placeholder="— Pick a skill —"
                options={skillOptions}
                selected={selectedSkills}
                onAdd={addSkill}
              />
              <p className="text-[10px] text-[hsl(var(--muted-foreground))] pl-4">
                Selected skills appear in the preview → drag to reorder
              </p>
            </div>

            {/* Layers */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[hsl(var(--amber))] shadow-[0_0_6px_hsl(var(--amber))]" />
                <Label htmlFor="layer-select">Add Personality Layer</Label>
                {selectedLayers.length > 0 && (
                  <Badge variant="amber" className="ml-auto">
                    {selectedLayers.length}
                  </Badge>
                )}
              </div>
              <AdditiveSelect
                id="layer-select"
                placeholder="— Pick a layer —"
                options={layerOptions}
                selected={selectedLayers}
                onAdd={addLayer}
              />
              <p className="text-[10px] text-[hsl(var(--muted-foreground))] pl-4">
                Selected layers appear in the preview → drag to reorder
              </p>
            </div>

            {/* AI Provider */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[hsl(var(--purple))] shadow-[0_0_6px_hsl(var(--purple))]" />
                <Label htmlFor="provider-select">AI Provider</Label>
              </div>
              <StyledSelect
                id="provider-select"
                value={selectedProvider}
                onChange={setSelectedProvider}
              >
                <option value="">— Choose provider —</option>
                {PROVIDERS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </StyledSelect>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
