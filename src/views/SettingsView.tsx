import { useEffect, useState } from "react";
import {
  SettingsRepository,
  FINNHUB_KEY,
  OPENROUTER_KEY,
  OPENROUTER_MODEL,
  DEFAULT_OPENROUTER_MODEL,
} from "../domain/settings";

export function SettingsView({
  settings,
  onSaved,
}: {
  settings: SettingsRepository;
  onSaved: () => void;
}) {
  const [finnhub, setFinnhub] = useState("");
  const [openrouter, setOpenrouter] = useState("");
  const [model, setModel] = useState(DEFAULT_OPENROUTER_MODEL);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    settings.get(FINNHUB_KEY).then((v) => setFinnhub(v ?? ""));
    settings.get(OPENROUTER_KEY).then((v) => setOpenrouter(v ?? ""));
    settings.get(OPENROUTER_MODEL).then((v) => setModel(v || DEFAULT_OPENROUTER_MODEL));
  }, [settings]);

  async function save() {
    try {
      await settings.set(FINNHUB_KEY, finnhub.trim());
      await settings.set(OPENROUTER_KEY, openrouter.trim());
      await settings.set(OPENROUTER_MODEL, model.trim() || DEFAULT_OPENROUTER_MODEL);
      setSaved(true);
      setSaveError(null);
      onSaved();
    } catch (e) {
      setSaveError((e as Error).message || "Failed to save");
      setSaved(false);
    }
  }

  const dirty = () => { setSaved(false); setSaveError(null); };

  return (
    <div style={{ padding: 16, maxWidth: 600 }}>
      <h2>Settings</h2>

      <label>Finnhub API key</label>
      <input
        type="password"
        value={finnhub}
        onChange={(e) => { setFinnhub(e.target.value); dirty(); }}
        style={{ display: "block", width: "100%", fontFamily: "monospace", marginBottom: 12 }}
        placeholder="finnhub key (live quotes)"
      />

      <label>OpenRouter API key</label>
      <input
        type="password"
        value={openrouter}
        onChange={(e) => { setOpenrouter(e.target.value); dirty(); }}
        style={{ display: "block", width: "100%", fontFamily: "monospace", marginBottom: 12 }}
        placeholder="openrouter key (smart import)"
      />

      <label>OpenRouter model</label>
      <input
        type="text"
        value={model}
        onChange={(e) => { setModel(e.target.value); dirty(); }}
        style={{ display: "block", width: "100%", fontFamily: "monospace", marginBottom: 12 }}
        placeholder={DEFAULT_OPENROUTER_MODEL}
      />

      <button onClick={save}>Save</button>
      {saved && <p style={{ color: "green" }}>Saved.</p>}
      {saveError && <p style={{ color: "crimson" }}>{saveError}</p>}

      <p style={{ color: "#666", marginTop: 16 }}>
        Finnhub: <a href="https://finnhub.io/register">finnhub.io</a> (live prices). OpenRouter:{" "}
        <a href="https://openrouter.ai/keys">openrouter.ai</a> (converts pasted markdown/JSON on import).
      </p>
    </div>
  );
}
