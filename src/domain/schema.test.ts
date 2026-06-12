import { describe, it, expect } from "vitest";
import { ImportPayload, TriggerSchema } from "./schema";

const minimalPayload = {
  plan: {
    title: "Test Plan",
    date: "2026-06-11",
    thesis_narrative: "A thesis.",
    methodology: ["rule one"],
    invalidation_conditions: ["if X then dead"],
    disclaimer: "Not financial advice.",
    source_url: "https://claude.ai/chat/abc",
  },
  positions: [],
  watchlist: [],
  events: [],
};

describe("ImportPayload", () => {
  it("accepts a minimal valid payload", () => {
    const r = ImportPayload.safeParse(minimalPayload);
    expect(r.success).toBe(true);
  });

  it("rejects a payload missing plan.title", () => {
    const bad = { ...minimalPayload, plan: { ...minimalPayload.plan, title: undefined } };
    const r = ImportPayload.safeParse(bad);
    expect(r.success).toBe(false);
  });
});

describe("TriggerSchema", () => {
  it("accepts a single-price kill trigger", () => {
    const r = TriggerSchema.safeParse({
      comparator: "<", price: 11.5, timeframe: "weekly_close", kind: "kill", requires_manual: true,
    });
    expect(r.success).toBe(true);
  });

  it("accepts a between buy trigger", () => {
    const r = TriggerSchema.safeParse({
      comparator: "between", price_low: 12.0, price_high: 12.5, timeframe: "spot", kind: "buy", requires_manual: false,
    });
    expect(r.success).toBe(true);
  });

  it("rejects a between trigger missing price_high", () => {
    const r = TriggerSchema.safeParse({
      comparator: "between", price_low: 12.0, timeframe: "spot", kind: "buy", requires_manual: false,
    });
    expect(r.success).toBe(false);
  });

  it("rejects a single-comparator trigger missing price", () => {
    const r = TriggerSchema.safeParse({
      comparator: "<", timeframe: "spot", kind: "kill", requires_manual: true,
    });
    expect(r.success).toBe(false);
  });
});
