import { SCHEMA_DESCRIPTION } from "../domain/schemaDescription";

export const TEMPLATE_PROMPT = `When you have finished the trading plan, output it twice:
first as a human-readable markdown summary, then as a single fenced \`\`\`json block
containing ONLY a JSON object conforming to the schema below. Do not add commentary
inside the json block.

${SCHEMA_DESCRIPTION}`;

export const EXTRACTION_PROMPT = `Read the trading conversation above and convert it into
the structured format below. Output a single fenced \`\`\`json block containing ONLY a JSON
object conforming to this schema. Preserve specifics (prices, tickers, dates). If a field
is unknown, use an empty string or empty array.

${SCHEMA_DESCRIPTION}`;
