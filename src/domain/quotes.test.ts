import { describe, it, expect } from "vitest";
import { fetchQuotes, HttpClient } from "./quotes";

function mockHttp(responses: Record<string, unknown>): HttpClient {
  return {
    async getJson(url: string) {
      const symbol = new URL(url).searchParams.get("symbol")!;
      const r = responses[symbol];
      if (r instanceof Error) throw r;
      return r;
    },
  };
}

describe("fetchQuotes", () => {
  it("maps a Finnhub quote response into a Quote", async () => {
    const http = mockHttp({ ACME: { c: 20.5, d: 0.5, dp: 2.5, pc: 20.0 } });
    const { quotes, failed } = await fetchQuotes(["ACME"], "key", http);
    expect(failed).toEqual([]);
    expect(quotes.get("ACME")).toEqual({
      ticker: "ACME", price: 20.5, change: 0.5, percentChange: 2.5, prevClose: 20.0,
    });
  });

  it("records a ticker with the unknown-symbol sentinel (c=0) as failed", async () => {
    const http = mockHttp({ NOPE: { c: 0, d: 0, dp: 0, pc: 0 } });
    const { quotes, failed } = await fetchQuotes(["NOPE"], "key", http);
    expect(quotes.size).toBe(0);
    expect(failed).toEqual(["NOPE"]);
  });

  it("records a thrown request as failed without failing the batch", async () => {
    const http = mockHttp({ ACME: { c: 20.5, d: 0.5, dp: 2.5, pc: 20.0 }, BAD: new Error("HTTP 429") });
    const { quotes, failed } = await fetchQuotes(["ACME", "BAD"], "key", http);
    expect(quotes.has("ACME")).toBe(true);
    expect(failed).toEqual(["BAD"]);
  });
});
