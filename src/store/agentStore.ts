import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AgentData, SavedAgent } from "@/types";
import { uid } from "@/lib/utils";

interface DraftState {
  data: AgentData | null;
  loading: boolean;
  error: string | null;

  selectedProfile: string;
  selectedSkills: string[];
  selectedLayers: string[];
  selectedProvider: string;
  agentName: string;

  setData: (d: AgentData) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;

  setSelectedProfile: (id: string) => void;
  addSkill: (id: string) => void;
  removeSkill: (id: string) => void;
  reorderSkills: (ids: string[]) => void;
  addLayer: (id: string) => void;
  removeLayer: (id: string) => void;
  reorderLayers: (ids: string[]) => void;
  setSelectedProvider: (p: string) => void;
  setAgentName: (n: string) => void;

  loadAgent: (agent: SavedAgent) => void;
  resetDraft: () => void;
}

export const useDraftStore = create<DraftState>()((set) => ({
  data: null,
  loading: false,
  error: null,

  selectedProfile: "",
  selectedSkills: [],
  selectedLayers: [],
  selectedProvider: "",
  agentName: "",

  setData: (data) => set({ data }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  setSelectedProfile: (id) => set({ selectedProfile: id }),

  addSkill: (id) =>
    set((s) =>
      s.selectedSkills.includes(id)
        ? s
        : { selectedSkills: [...s.selectedSkills, id] },
    ),
  removeSkill: (id) =>
    set((s) => ({ selectedSkills: s.selectedSkills.filter((x) => x !== id) })),
  reorderSkills: (ids) => set({ selectedSkills: ids }),

  addLayer: (id) =>
    set((s) =>
      s.selectedLayers.includes(id)
        ? s
        : { selectedLayers: [...s.selectedLayers, id] },
    ),
  removeLayer: (id) =>
    set((s) => ({ selectedLayers: s.selectedLayers.filter((x) => x !== id) })),
  reorderLayers: (ids) => set({ selectedLayers: ids }),

  setSelectedProvider: (p) => set({ selectedProvider: p }),
  setAgentName: (n) => set({ agentName: n }),

  loadAgent: (agent) =>
    set({
      selectedProfile: agent.profileId ?? "",
      selectedSkills: agent.skillIds ?? [],
      selectedLayers: agent.layerIds ?? [],
      selectedProvider: agent.provider ?? "",
      agentName: agent.name,
    }),

  resetDraft: () =>
    set({
      selectedProfile: "",
      selectedSkills: [],
      selectedLayers: [],
      selectedProvider: "",
      agentName: "",
    }),
}));

interface SavedState {
  savedAgents: SavedAgent[];
  saveAgent: (draft: Omit<SavedAgent, "id" | "createdAt">) => void;
  deleteAgent: (id: string) => void;
  clearAll: () => void;
}

export const useSavedStore = create<SavedState>()(
  persist(
    (set) => ({
      savedAgents: [],

      saveAgent: (draft) =>
        set((s) => ({
          savedAgents: [
            ...s.savedAgents,
            { ...draft, id: uid(), createdAt: Date.now() },
          ],
        })),

      deleteAgent: (id) =>
        set((s) => ({
          savedAgents: s.savedAgents.filter((a) => a.id !== id),
        })),

      clearAll: () => set({ savedAgents: [] }),
    }),
    { name: "saved-agents" },
  ),
);
