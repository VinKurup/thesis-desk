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

  useEffect(() => {
    settings.get(FINNHUB_KEY).then((v) => setKey(v ?? ""));
  }, [settings]);

  async function save() {
    await settings.set(FINNHUB_KEY, key.trim());
    setSaved(true);
    onSaved();
  }

  return (
    <div style={{ padding: 16, maxWidth: 600 }}>
      <h2>Settings</h2>
      <label>Finnhub API key</label>
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <input
          type="password"
          value={key}
          onChange={(e) => { setKey(e.target.value); setSaved(false); }}
          style={{ flex: 1, fontFamily: "monospace" }}
          placeholder="paste key"
        />
        <button onClick={save}>Save</button>
      </div>
      {saved && <p style={{ color: "green" }}>Saved.</p>}
      <p style={{ color: "#666" }}>
        Get a free key at <a href="https://finnhub.io/register">finnhub.io</a>.
      </p>
    </div>
  );
}
