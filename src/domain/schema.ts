import { z } from "zod";

export const TradeLegSchema = z.object({
  kind: z.enum(["share", "call", "put"]),
  strike: z.number().optional(),
  expiry: z.string().optional(),       // e.g. "2028-01"
  quantity: z.number().optional(),
  cost_basis: z.number().optional(),
  delta: z.number().optional(),
  manual_mark: z.number().optional(),
});

export const StructureSchema = z.object({
  text: z.string().default(""),
  legs: z.array(TradeLegSchema).default([]),
});

export const TrancheSchema = z.object({
  label: z.string(),
  trigger_condition: z.string(),
  size: z.string(),
  filled: z.boolean().default(false),
});

export const TriggerSchema = z
  .object({
    comparator: z.enum(["<", "<=", ">", ">=", "between"]),
    price: z.number().optional(),
    price_low: z.number().optional(),
    price_high: z.number().optional(),
    timeframe: z.enum(["spot", "daily_close", "weekly_close"]),
    kind: z.enum(["buy", "kill", "reclaim"]),
    requires_manual: z.boolean(),
  })
  .superRefine((t, ctx) => {
    if (t.comparator === "between") {
      if (t.price_low === undefined || t.price_high === undefined) {
        ctx.addIssue({ code: "custom", message: "between requires price_low and price_high" });
      }
    } else if (t.price === undefined) {
      ctx.addIssue({ code: "custom", message: "comparator requires price" });
    }
  });

export const PositionSchema = z.object({
  ticker: z.string(),
  name: z.string(),
  role: z.string(),                    // PRIMARY | SECONDARY | HELD | WAIT | free label
  status: z.enum(["enterable", "wait", "held", "closed"]),
  thesis: z.string(),
  structure: StructureSchema.default({ text: "", legs: [] }),
  tranches: z.array(TrancheSchema).default([]),
  kill_trigger: z.string().default(""),
  catalyst_confirm: z.array(z.string()).default([]),
  catalyst_kill: z.array(z.string()).default([]),
  monitors: z.array(z.string()).default([]),
  bet_one_sentence: z.string().default(""),
  scenario_target: z.string().default(""),
  triggers: z.array(TriggerSchema).default([]),
});

export const WatchlistItemSchema = z.object({
  ticker: z.string(),
  price_note: z.string().default(""),
  narrative: z.string().default(""),
  needs: z.string().default(""),
  score: z.string().default(""),
  status: z.enum(["watching", "off_board"]).default("watching"),
  off_board_reason: z.string().default(""),
});

export const CalendarEventSchema = z.object({
  date: z.string(),                    // "2026-08-26" or approximate text
  description: z.string(),
  ticker: z.string().optional(),
  type: z.enum(["earnings", "filing", "alert", "other"]).default("other"),
});

export const PlanMetaSchema = z.object({
  title: z.string(),
  date: z.string(),
  tagline: z.string().default(""),
  thesis_narrative: z.string(),
  methodology: z.array(z.string()).default([]),
  invalidation_conditions: z.array(z.string()).default([]),
  disclaimer: z.string().default(""),
  source_url: z.string().default(""),
});

export const ImportPayload = z.object({
  plan: PlanMetaSchema,
  positions: z.array(PositionSchema).default([]),
  watchlist: z.array(WatchlistItemSchema).default([]),
  events: z.array(CalendarEventSchema).default([]),
});

export type TradeLeg = z.infer<typeof TradeLegSchema>;
export type Tranche = z.infer<typeof TrancheSchema>;
export type Trigger = z.infer<typeof TriggerSchema>;
export type Position = z.infer<typeof PositionSchema>;
export type WatchlistItem = z.infer<typeof WatchlistItemSchema>;
export type CalendarEvent = z.infer<typeof CalendarEventSchema>;
export type PlanMeta = z.infer<typeof PlanMetaSchema>;
export type ImportPayloadType = z.infer<typeof ImportPayload>;
