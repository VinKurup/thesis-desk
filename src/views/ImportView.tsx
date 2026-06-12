import { useState } from "react";
import { PlanStore } from "../state/planStore";
import { SettingsRepository, OPENROUTER_KEY } from "../domain/settings";
import { smartImport } from "../state/smartImport";
import { parseImport } from "../domain/import";
import { convertToPlan } from "../domain/llmConvert";
import { createOpenRouterClient } from "../domain/openrouter";
import { TEMPLATE_PROMPT, EXTRACTION_PROMPT } from "./prompts";

export function ImportView({
  store,
  settings,
}: {
  store: PlanStore;
  settings: SettingsRepository;
}) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function onImport() {
    setBusy(true);
    setStatus(null);
    try {
      const apiKey = await settings.get(OPENROUTER_KEY);
      const result = await smartImport(text, {
        parse: parseImport,
        hasKey: !!apiKey,
        convert: (raw) => convertToPlan(raw, createOpenRouterClient(settings)),
      });
      if (result.ok) {
        await store.applyImport(result.payload);
        setStatus({
          ok: true,
          msg: result.via === "llm" ? "Imported (converted via OpenRouter)." : "Imported successfully.",
        });
      } else {
        const hint =
          result.stage === "strict" && !apiKey
            ? "\n\nTip: add an OpenRouter key in Settings to auto-convert markdown / loose JSON, or use the extraction prompt below."
            : "";
        setStatus({ ok: false, msg: result.error + hint });
      }
    } catch (e) {
      setStatus({ ok: false, msg: (e as Error).message || "Unexpected error during import." });
    } finally {
      setBusy(false);
    }
  }

  function copy(value: string) {
    navigator.clipboard.writeText(value).catch(() => {});
  }

  return (
    <div style={{ padding: 16, maxWidth: 900 }}>
      <h2>Import plan</h2>
      <p>Paste a Claude plan — JSON, a message with a ```json block, or plain markdown (auto-converted if an OpenRouter key is set).</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={14}
        style={{ width: "100%", fontFamily: "monospace" }}
        placeholder="Paste plan here…"
      />
      <div style={{ marginTop: 8 }}>
        <button onClick={onImport} disabled={busy}>{busy ? "Importing…" : "Import"}</button>
      </div>
      {status && (
        <pre style={{ color: status.ok ? "green" : "crimson", whiteSpace: "pre-wrap" }}>{status.msg}</pre>
      )}

      <h3 style={{ marginTop: 24 }}>Prompts</h3>
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={() => copy(TEMPLATE_PROMPT)}>Copy template prompt</button>
        <button onClick={() => copy(EXTRACTION_PROMPT)}>Copy extraction prompt</button>
      </div>
    </div>
  );
}
