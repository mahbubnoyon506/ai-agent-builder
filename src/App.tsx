import { useState, useEffect, useCallback, useMemo } from "react";
import "./App.css";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AgentProfile {
  id: string;
  name: string;
  description: string;
}

interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
}

interface Layer {
  id: string;
  name: string;
  type: string;
  description: string;
}

interface AgentData {
  agentProfiles: AgentProfile[];
  skills: Skill[];
  layers: Layer[];
}

interface SavedAgent {
  id: string; // BUG FIX: stable ID instead of array-index key
  name: string;
  profileId: string;
  skillIds: string[];
  layerIds: string[];
  provider?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PROVIDERS = ["Claude", "ChatGPT", "Gemini", "DeepSeek", "Kimi"] as const;

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ChipList({
  ids,
  lookup,
  onRemove,
  emptyLabel,
  colorClass,
}: {
  ids: string[];
  lookup: Map<string, string>;
  onRemove: (id: string) => void;
  emptyLabel: string;
  colorClass: string;
}) {
  if (ids.length === 0) {
    return <p className="empty-hint">{emptyLabel}</p>;
  }
  return (
    <ul className="chip-list">
      {ids.map((id) => (
        <li key={id} className={`chip ${colorClass}`}>
          <span>{lookup.get(id) ?? id}</span>
          <button
            className="chip-remove"
            onClick={() => onRemove(id)}
            aria-label="Remove"
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  );
}

function AgentCard({
  agent,
  profileName,
  onLoad,
  onDelete,
}: {
  agent: SavedAgent;
  profileName: string;
  onLoad: () => void;
  onDelete: () => void;
}) {
  return (
    // BUG FIX: key is applied by parent using agent.id, not array index
    <div className="agent-card">
      <div className="agent-card-header">
        <span className="agent-card-avatar">
          {agent.name.charAt(0).toUpperCase()}
        </span>
        <div>
          <h3 className="agent-card-name">{agent.name}</h3>
          <p className="agent-card-provider">
            {agent.provider || "No provider"}
          </p>
        </div>
      </div>
      <dl className="agent-card-meta">
        <div>
          <dt>Profile</dt>
          <dd>{profileName || "—"}</dd>
        </div>
        <div>
          <dt>Skills</dt>
          <dd>{agent.skillIds.length}</dd>
        </div>
        <div>
          <dt>Layers</dt>
          <dd>{agent.layerIds.length}</dd>
        </div>
      </dl>
      <div className="agent-card-actions">
        <button className="btn-load" onClick={onLoad}>
          Load
        </button>
        <button className="btn-delete" onClick={onDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

function App() {
  const [data, setData] = useState<AgentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedProfile, setSelectedProfile] = useState<string>("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedLayers, setSelectedLayers] = useState<string[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [agentName, setAgentName] = useState("");

  const [savedAgents, setSavedAgents] = useState<SavedAgent[]>([]);

  // ── Load persisted agents once on mount ──────────────────────────────────
  useEffect(() => {
    const raw = localStorage.getItem("savedAgents");
    if (raw) {
      try {
        setSavedAgents(JSON.parse(raw));
      } catch (e) {
        console.error("Failed to parse saved agents", e);
      }
    }
  }, []);

  // BUG FIX: analytics interval now correctly includes agentName in deps
  // so it always reflects the latest value.
  useEffect(() => {
    const interval = setInterval(() => {
      console.log(
        agentName
          ? `[Analytics] Draft name: "${agentName}"`
          : "[Analytics] Unnamed draft in progress",
      );
    }, 8000);
    return () => clearInterval(interval);
  }, [agentName]);

  // ── Fetch configuration data ──────────────────────────────────────────────
  // BUG FIX: wrapped in useCallback so the reference is stable and won't
  // cause infinite loops if passed as a dependency elsewhere.
  const fetchAPI = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const delay = Math.floor(Math.random() * 2000) + 1000;
      await new Promise((r) => setTimeout(r, delay));
      const res = await fetch("/data.json");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to fetch data";
      console.error(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch once on mount
  useEffect(() => {
    fetchAPI();
  }, [fetchAPI]);

  // ── Memoised lookup maps (avoids repeated .find() in render) ─────────────
  // BUG FIX: profile description looked up once, not twice as in original JSX
  const skillNameMap = useMemo<Map<string, string>>(
    () => new Map(data?.skills.map((s) => [s.id, s.name]) ?? []),
    [data],
  );
  const layerNameMap = useMemo<Map<string, string>>(
    () => new Map(data?.layers.map((l) => [l.id, l.name]) ?? []),
    [data],
  );
  const profileNameMap = useMemo<Map<string, string>>(
    () => new Map(data?.agentProfiles.map((p) => [p.id, p.name]) ?? []),
    [data],
  );

  const selectedProfileObj = useMemo(
    () => data?.agentProfiles.find((p) => p.id === selectedProfile) ?? null,
    [data, selectedProfile],
  );

  // ── Handlers ─────────────────────────────────────────────────────────────

  // BUG FIX: no longer mutates state array directly; creates new array
  // BUG FIX: no longer calls fetchAPI() — selecting a skill shouldn't re-fetch
  const handleSkillSelect = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const id = e.target.value;
      if (id)
        setSelectedSkills((prev) => (prev.includes(id) ? prev : [...prev, id]));
      e.target.value = "";
    },
    [],
  );

  // BUG FIX: same two fixes applied to layer handler
  const handleLayerSelect = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const id = e.target.value;
      if (id)
        setSelectedLayers((prev) => (prev.includes(id) ? prev : [...prev, id]));
      e.target.value = "";
    },
    [],
  );

  // BUG FIX: profile change no longer triggers fetchAPI()
  const handleProfileChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedProfile(e.target.value);
    },
    [],
  );

  const removeSkill = useCallback((id: string) => {
    setSelectedSkills((prev) => prev.filter((s) => s !== id));
  }, []);

  const removeLayer = useCallback((id: string) => {
    setSelectedLayers((prev) => prev.filter((l) => l !== id));
  }, []);

  const handleSaveAgent = useCallback(() => {
    if (!agentName.trim()) {
      alert("Please enter a name for your agent.");
      return;
    }
    const newAgent: SavedAgent = {
      id: uid(), // BUG FIX: stable ID — never use array index as React key
      name: agentName.trim(),
      profileId: selectedProfile,
      skillIds: [...selectedSkills],
      layerIds: [...selectedLayers],
      provider: selectedProvider,
    };
    setSavedAgents((prev) => {
      const updated = [...prev, newAgent];
      localStorage.setItem("savedAgents", JSON.stringify(updated));
      return updated;
    });
    setAgentName("");
    alert(`Agent "${newAgent.name}" saved!`);
  }, [
    agentName,
    selectedProfile,
    selectedSkills,
    selectedLayers,
    selectedProvider,
  ]);

  const handleLoadAgent = useCallback((agent: SavedAgent) => {
    setSelectedProfile(agent.profileId ?? "");
    setSelectedSkills(agent.skillIds ?? []);
    setSelectedLayers(agent.layerIds ?? []);
    setSelectedProvider(agent.provider ?? "");
    setAgentName(agent.name);
  }, []);

  const handleDeleteAgent = useCallback((id: string) => {
    setSavedAgents((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      localStorage.setItem("savedAgents", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleClearAll = useCallback(() => {
    if (confirm("Clear all saved agents?")) {
      setSavedAgents([]);
      localStorage.removeItem("savedAgents");
    }
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="app-shell">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="app-header">
        <div className="header-brand">
          <span className="header-icon">⬡</span>
          <div>
            <h1 className="header-title">Agent Builder</h1>
            <p className="header-sub">Compose intelligent AI profiles</p>
          </div>
        </div>
        <button
          className="btn-reload"
          onClick={fetchAPI}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? (
            <>
              <span className="spinner" /> Loading…
            </>
          ) : (
            <>
              <span>↻</span> Reload Config
            </>
          )}
        </button>
      </header>

      <main className="app-main">
        {/* ── Error banner ───────────────────────────────────────────────── */}
        {error && (
          <div className="error-banner" role="alert">
            ⚠ {error} —{" "}
            <button className="error-retry" onClick={fetchAPI}>
              retry
            </button>
          </div>
        )}

        <div className="workspace">
          {/* ── Left: Config panel ───────────────────────────────────────── */}
          <section className="panel config-panel" aria-label="Configuration">
            <div className="panel-header">
              <h2 className="panel-title">Configuration</h2>
              {loading && <span className="loading-badge">Fetching…</span>}
            </div>

            {!data && !loading && !error && (
              <p className="empty-hint" style={{ marginTop: "1rem" }}>
                No data loaded yet.
              </p>
            )}

            {data && (
              <div className="config-fields">
                <div className="field-group">
                  <label htmlFor="profile-select" className="field-label">
                    <span className="field-dot dot-blue" /> Base Profile
                  </label>
                  <select
                    id="profile-select"
                    value={selectedProfile}
                    onChange={handleProfileChange}
                    className="select"
                  >
                    <option value="">— Choose a profile —</option>
                    {data.agentProfiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  {selectedProfileObj && (
                    <p className="field-hint">
                      {selectedProfileObj.description}
                    </p>
                  )}
                </div>

                <div className="field-group">
                  <label htmlFor="skill-select" className="field-label">
                    <span className="field-dot dot-green" /> Add Skill
                  </label>
                  <select
                    id="skill-select"
                    onChange={handleSkillSelect}
                    defaultValue=""
                    className="select"
                  >
                    <option value="" disabled>
                      — Pick a skill —
                    </option>
                    {data.skills.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} · {s.category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field-group">
                  <label htmlFor="layer-select" className="field-label">
                    <span className="field-dot dot-amber" /> Add Personality
                    Layer
                  </label>
                  <select
                    id="layer-select"
                    onChange={handleLayerSelect}
                    defaultValue=""
                    className="select"
                  >
                    <option value="" disabled>
                      — Pick a layer —
                    </option>
                    {data.layers.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} · {l.type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field-group">
                  <label htmlFor="provider-select" className="field-label">
                    <span className="field-dot dot-purple" /> AI Provider
                  </label>
                  <select
                    id="provider-select"
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value)}
                    className="select"
                  >
                    <option value="">— Choose provider —</option>
                    {PROVIDERS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </section>

          {/* ── Right: Preview + Save ─────────────────────────────────────── */}
          <section className="panel preview-panel" aria-label="Agent preview">
            <div className="panel-header">
              <h2 className="panel-title">Current Agent</h2>
            </div>

            <div className="preview-body">
              <div className="preview-section">
                <h3 className="preview-label">
                  <span className="field-dot dot-blue" /> Profile
                </h3>
                {selectedProfileObj ? (
                  <p className="preview-value">
                    <strong>{selectedProfileObj.name}</strong>
                    <span className="preview-desc">
                      {" "}
                      — {selectedProfileObj.description}
                    </span>
                  </p>
                ) : (
                  <p className="empty-hint">No profile selected.</p>
                )}
              </div>

              <div className="preview-section">
                <h3 className="preview-label">
                  <span className="field-dot dot-green" /> Skills
                  {selectedSkills.length > 0 && (
                    <span className="badge">{selectedSkills.length}</span>
                  )}
                </h3>
                <ChipList
                  ids={selectedSkills}
                  lookup={skillNameMap}
                  onRemove={removeSkill}
                  emptyLabel="No skills added."
                  colorClass="chip-green"
                />
              </div>

              <div className="preview-section">
                <h3 className="preview-label">
                  <span className="field-dot dot-amber" /> Layers
                  {selectedLayers.length > 0 && (
                    <span className="badge">{selectedLayers.length}</span>
                  )}
                </h3>
                <ChipList
                  ids={selectedLayers}
                  lookup={layerNameMap}
                  onRemove={removeLayer}
                  emptyLabel="No layers added."
                  colorClass="chip-amber"
                />
              </div>

              <div className="preview-section">
                <h3 className="preview-label">
                  <span className="field-dot dot-purple" /> Provider
                </h3>
                {selectedProvider ? (
                  <p className="preview-value">{selectedProvider}</p>
                ) : (
                  <p className="empty-hint">No provider selected.</p>
                )}
              </div>

              <div className="save-strip">
                <input
                  type="text"
                  placeholder="Name this agent…"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="name-input"
                  onKeyDown={(e) => e.key === "Enter" && handleSaveAgent()}
                />
                <button className="btn-save" onClick={handleSaveAgent}>
                  Save Agent
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* ── Saved agents ─────────────────────────────────────────────────── */}
        {savedAgents.length > 0 && (
          <section className="saved-section" aria-label="Saved agents">
            <div className="saved-header">
              <h2 className="saved-title">
                Saved Agents <span className="badge">{savedAgents.length}</span>
              </h2>
              <button className="btn-clear" onClick={handleClearAll}>
                Clear all
              </button>
            </div>
            <div className="agent-grid">
              {/* BUG FIX: key is agent.id (stable), not array index */}
              {savedAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  profileName={profileNameMap.get(agent.profileId) ?? ""}
                  onLoad={() => handleLoadAgent(agent)}
                  onDelete={() => handleDeleteAgent(agent.id)}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
