import { useEffect, useState } from "react";
import { SettingsRepository, FINNHUB_KEY } from "../domain/settings";

export function SettingsView({
  settings,
  onSaved,
}: {
  settings: SettingsRepository;
  onSaved: () => void;
}) {
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    settings.get(FINNHUB_KEY).then((v) => setKey(v ?? ""));
  }, [settings]);

  async function save() {
    try {
      await settings.set(FINNHUB_KEY, key.trim());
      setSaved(true);
      setSaveError(null);
      onSaved();
    } catch (e) {
      setSaveError((e as Error).message || "Failed to save");
      setSaved(false);
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 600 }}>
      <h2>Settings</h2>
      <label>Finnhub API key</label>
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <input
          type="password"
          value={key}
          onChange={(e) => { setKey(e.target.value); setSaved(false); setSaveError(null); }}
          style={{ flex: 1, fontFamily: "monospace" }}
          placeholder="paste key"
        />
        <button onClick={save}>Save</button>
      </div>
      {saved && <p style={{ color: "green" }}>Saved.</p>}
      {saveError && <p style={{ color: "crimson" }}>{saveError}</p>}
      <p style={{ color: "#666" }}>
        Get a free key at <a href="https://finnhub.io/register">finnhub.io</a>.
      </p>
    </div>
  );
}
