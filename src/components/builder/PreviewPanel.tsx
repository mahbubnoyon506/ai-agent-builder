import { useMemo } from "react";
import { Save, RotateCcw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SortableList } from "./SortableList";
import { useDraftStore, useSavedStore } from "@/store/agentStore";

export function PreviewPanel() {
  const data = useDraftStore((s) => s.data);
  const selectedProfile = useDraftStore((s) => s.selectedProfile);
  const selectedSkills = useDraftStore((s) => s.selectedSkills);
  const selectedLayers = useDraftStore((s) => s.selectedLayers);
  const selectedProvider = useDraftStore((s) => s.selectedProvider);
  const agentName = useDraftStore((s) => s.agentName);

  const removeSkill = useDraftStore((s) => s.removeSkill);
  const reorderSkills = useDraftStore((s) => s.reorderSkills);
  const removeLayer = useDraftStore((s) => s.removeLayer);
  const reorderLayers = useDraftStore((s) => s.reorderLayers);
  const setAgentName = useDraftStore((s) => s.setAgentName);
  const resetDraft = useDraftStore((s) => s.resetDraft);

  const saveAgent = useSavedStore((s) => s.saveAgent);

  // Memoised lookup maps
  const skillLabelMap = useMemo(
    () => new Map(data?.skills.map((s) => [s.id, s.name]) ?? []),
    [data],
  );
  const skillSubMap = useMemo(
    () => new Map(data?.skills.map((s) => [s.id, s.category]) ?? []),
    [data],
  );
  const layerLabelMap = useMemo(
    () => new Map(data?.layers.map((l) => [l.id, l.name]) ?? []),
    [data],
  );
  const layerSubMap = useMemo(
    () => new Map(data?.layers.map((l) => [l.id, l.type]) ?? []),
    [data],
  );
  const selectedProfileObj = useMemo(
    () => data?.agentProfiles.find((p) => p.id === selectedProfile) ?? null,
    [data, selectedProfile],
  );

  function handleSave() {
    if (!agentName.trim()) {
      alert("Please enter a name for your agent.");
      return;
    }
    saveAgent({
      name: agentName.trim(),
      profileId: selectedProfile,
      skillIds: [...selectedSkills],
      layerIds: [...selectedLayers],
      provider: selectedProvider,
    });
    alert(`Agent "${agentName.trim()}" saved!`);
    setAgentName("");
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold tracking-tight">
            Current Agent
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetDraft}
            className="gap-1.5 text-xs text-[hsl(var(--muted-foreground))]"
          >
            <RotateCcw size={12} />
            Reset
          </Button>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="flex flex-col gap-5 pt-5 flex-1 overflow-y-auto">
        {/* Profile */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[hsl(var(--primary))] shadow-[0_0_6px_hsl(var(--primary))]" />
            <Label>Profile</Label>
          </div>
          {selectedProfileObj ? (
            <div className="rounded-(--radius) border border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary)/0.06)] px-3 py-2">
              <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                {selectedProfileObj.name}
              </p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5 leading-relaxed">
                {selectedProfileObj.description}
              </p>
            </div>
          ) : (
            <p className="text-xs italic text-[hsl(var(--muted-foreground))]">
              No profile selected.
            </p>
          )}
        </div>

        {/* Skills — sortable */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[hsl(var(--green))] shadow-[0_0_6px_hsl(var(--green))]" />
            <Label>Skills</Label>
            {selectedSkills.length > 0 && (
              <Badge variant="green" className="ml-auto">
                {selectedSkills.length}
              </Badge>
            )}
          </div>
          <SortableList
            ids={selectedSkills}
            labelMap={skillLabelMap}
            sublabelMap={skillSubMap}
            onRemove={removeSkill}
            onReorder={reorderSkills}
            colorVariant="green"
            emptyMessage="No skills added — pick from Configuration"
          />
        </div>

        {/* Layers — sortable */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[hsl(var(--amber))] shadow-[0_0_6px_hsl(var(--amber))]" />
            <Label>Personality Layers</Label>
            {selectedLayers.length > 0 && (
              <Badge variant="amber" className="ml-auto">
                {selectedLayers.length}
              </Badge>
            )}
          </div>
          <SortableList
            ids={selectedLayers}
            labelMap={layerLabelMap}
            sublabelMap={layerSubMap}
            onRemove={removeLayer}
            onReorder={reorderLayers}
            colorVariant="amber"
            emptyMessage="No layers added — pick from Configuration"
          />
        </div>

        {/* Provider */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[hsl(var(--purple))] shadow-[0_0_6px_hsl(var(--purple))]" />
            <Label>AI Provider</Label>
          </div>
          {selectedProvider ? (
            <Badge variant="purple" className="w-fit px-3 py-1 text-xs">
              {selectedProvider}
            </Badge>
          ) : (
            <p className="text-xs italic text-[hsl(var(--muted-foreground))]">
              No provider selected.
            </p>
          )}
        </div>
      </CardContent>

      {/* Save strip */}
      <div className="px-5 pb-5 pt-4 border-t border-[hsl(var(--border))] mt-auto">
        <p className="text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))] mb-2 font-semibold">
          Save Agent
        </p>
        <div className="flex gap-2">
          <Input
            placeholder="Name this agent…"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            className="flex-1"
          />
          <Button
            onClick={handleSave}
            size="default"
            className="gap-1.5 shrink-0"
          >
            <Save size={14} />
            Save
          </Button>
        </div>
      </div>
    </Card>
  );
}
