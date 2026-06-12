const SCHEMA_DESCRIPTION = `The JSON object has this shape:
{
  "plan": { "title", "date" (YYYY-MM-DD), "tagline", "thesis_narrative",
            "methodology": [string], "invalidation_conditions": [string],
            "disclaimer", "source_url" },
  "positions": [ { "ticker", "name", "role", "status": "enterable|wait|held|closed",
            "thesis", "structure": { "text", "legs": [ { "kind": "share|call|put",
            "strike"?, "expiry"?, "quantity"?, "cost_basis"?, "delta"? } ] },
            "tranches": [ { "label", "trigger_condition", "size" } ],
            "kill_trigger", "catalyst_confirm": [string], "catalyst_kill": [string],
            "monitors": [string], "bet_one_sentence", "scenario_target",
            "triggers": [ { "comparator": "<|<=|>|>=|between", "price"? (single),
            "price_low"?,"price_high"? (between), "timeframe": "spot|daily_close|weekly_close",
            "kind": "buy|kill|reclaim", "requires_manual": boolean } ] } ],
  "watchlist": [ { "ticker", "price_note", "narrative", "needs", "score",
            "status": "watching|off_board", "off_board_reason" } ],
  "events": [ { "date", "description", "ticker"?, "type": "earnings|filing|alert|other" } ]
}
For each numeric price level mentioned as a buy zone or kill line, also emit a structured
"triggers" entry. Set "requires_manual": true when the condition is qualitative
(e.g. "on volume") or depends on a weekly/daily close.`;

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
