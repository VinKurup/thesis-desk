import { ParseResult } from "../domain/import";
import { ImportPayloadType } from "../domain/schema";

export type SmartImportResult =
  | { ok: true; payload: ImportPayloadType; via: "strict" | "llm" }
  | { ok: false; stage: "strict" | "llm"; error: string };

export interface SmartImportDeps {
  parse: (raw: string) => ParseResult;
  hasKey: boolean;
  convert: (raw: string) => Promise<ParseResult>;
}

export async function smartImport(raw: string, deps: SmartImportDeps): Promise<SmartImportResult> {
  const strict = deps.parse(raw);
  if (strict.ok) return { ok: true, payload: strict.value, via: "strict" };
  if (!deps.hasKey) return { ok: false, stage: "strict", error: strict.error };
  const converted = await deps.convert(raw);
  if (converted.ok) return { ok: true, payload: converted.value, via: "llm" };
  return { ok: false, stage: "llm", error: converted.error };
}
