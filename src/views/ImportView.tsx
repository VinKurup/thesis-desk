import { useState } from "react";
import { PlanStore } from "../state/planStore";
import { TEMPLATE_PROMPT, EXTRACTION_PROMPT } from "./prompts";

export function ImportView({ store }: { store: PlanStore }) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  async function onImport() {
    const result = await store.importText(text);
    if (result.ok) setStatus({ ok: true, msg: "Imported successfully." });
    else setStatus({ ok: false, msg: result.error });
  }

  function copy(value: string) {
    navigator.clipboard.writeText(value);
  }

  return (
    <div style={{ padding: 16, maxWidth: 900 }}>
      <h2>Import plan</h2>
      <p>Paste the JSON (or a message containing a ```json block) produced by Claude.</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={14}
        style={{ width: "100%", fontFamily: "monospace" }}
        placeholder="Paste plan JSON here…"
      />
      <div style={{ marginTop: 8 }}>
        <button onClick={onImport}>Import</button>
      </div>
      {status && (
        <pre style={{ color: status.ok ? "green" : "crimson", whiteSpace: "pre-wrap" }}>
          {status.msg}
        </pre>
      )}

      <h3 style={{ marginTop: 24 }}>Prompts</h3>
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={() => copy(TEMPLATE_PROMPT)}>Copy template prompt</button>
        <button onClick={() => copy(EXTRACTION_PROMPT)}>Copy extraction prompt</button>
      </div>
    </div>
  );
}
