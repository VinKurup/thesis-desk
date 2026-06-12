import { describe, it, expect } from "vitest";
import { createQuoteStore, QuoteFetcher } from "./quoteStore";
import { InMemorySettingsRepository, FINNHUB_KEY } from "../domain/settings";
import { buildStoredPlan } from "../domain/repository";
import { ImportPayload } from "../domain/schema";
import { examplePlanJson } from "../test/fixtures/examplePlan";
import { Quote } from "../domain/quotes";

const plan = buildStoredPlan(ImportPayload.parse(examplePlanJson));

const okFetcher: QuoteFetcher = async (tickers) => {
  const quotes = new Map<string, Quote>();
  for (const t of tickers) quotes.set(t, { ticker: t, price: 15.5, change: 0, percentChange: 1, prevClose: 15 });
  return { quotes, failed: [] };
};

describe("quoteStore", () => {
  it("sets a settings prompt when no API key is present", async () => {
    const store = createQuoteStore({ settings: new InMemorySettingsRepository(), fetchQuotes: okFetcher });
    await store.refresh(plan.positions, plan.watchlist);
    expect(store.getState().error).toMatch(/settings/i);
    expect(store.getState().quotes.size).toBe(0);
  });

  it("populates quotes and statuses when a key is present", async () => {
    const settings = new InMemorySettingsRepository();
    await settings.set(FINNHUB_KEY, "key");
    const store = createQuoteStore({ settings, fetchQuotes: okFetcher, now: () => 1000 });
    await store.refresh(plan.positions, plan.watchlist);
    const s = store.getState();
    expect(s.quotes.get("ACME")?.price).toBe(15.5);
    expect(s.statuses.length).toBeGreaterThan(0);
    expect(s.lastUpdated).toBe(1000);
    expect(s.error).toBeNull();
  });

  it("captures a fetch error without throwing and keeps loading false", async () => {
    const settings = new InMemorySettingsRepository();
    await settings.set(FINNHUB_KEY, "key");
    const failing: QuoteFetcher = async () => { throw new Error("network down"); };
    const store = createQuoteStore({ settings, fetchQuotes: failing });
    await store.refresh(plan.positions, plan.watchlist);
    expect(store.getState().error).toMatch(/network down/);
    expect(store.getState().loading).toBe(false);
  });
});
