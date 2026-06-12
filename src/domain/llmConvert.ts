import { SCHEMA_DESCRIPTION } from "./schemaDescription";
import { parseImport, ParseResult } from "./import";
import { LlmClient } from "./llm";

export function buildConversionPrompt(rawText: string): string {
  return `You convert a trading plan into a strict JSON schema for a dashboard.

${SCHEMA_DESCRIPTION}

Convert the plan below into a single fenced \`\`\`json block conforming EXACTLY to that schema.
Rules:
- Map synonyms to the schema field names (e.g. a "why" array -> a single "thesis" string; a tranche "id"/"trigger" -> "label"/"trigger_condition"; a "monitors" object -> an array of strings).
- Coerce each position "status" to one of: enterable, wait, held, closed.
- For every numeric buy zone or kill line, emit a structured "triggers" entry; set "requires_manual": true when the condition is qualitative ("on volume") or depends on a weekly/daily close.
- Output ONLY the \`\`\`json block, with no commentary.

PLAN:
${rawText}`;
}

export async function convertToPlan(rawText: string, llm: LlmClient): Promise<ParseResult> {
  const reply = await llm.complete(buildConversionPrompt(rawText));
  return parseImport(reply);
}
