import { ImportPayload, ImportPayloadType } from "./schema";

export type ParseResult =
  | { ok: true; value: ImportPayloadType }
  | { ok: false; error: string };

/** Extract JSON from a fenced ```json block if present, else return the trimmed input. */
function extractJsonText(raw: string): string {
  const fence = raw.match(/```json\s*([\s\S]*?)```/i) ?? raw.match(/```\s*([\s\S]*?)```/);
  return (fence ? fence[1] : raw).trim();
}

export function parseImport(raw: string): ParseResult {
  let json: unknown;
  try {
    json = JSON.parse(extractJsonText(raw));
  } catch (e) {
    return { ok: false, error: `Invalid JSON: ${(e as Error).message}` };
  }
  const result = ImportPayload.safeParse(json);
  if (!result.success) {
    const error = result.error.issues
      .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    return { ok: false, error };
  }
  return { ok: true, value: result.data };
}
