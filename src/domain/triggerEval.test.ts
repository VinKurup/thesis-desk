import { describe, it, expect } from "vitest";
import { evaluateTriggers, positionAccent } from "./triggerEval";
import { buildStoredPlan } from "./repository";
import { ImportPayload } from "./schema";
import { examplePlanJson } from "../test/fixtures/examplePlan";
import { Quote } from "./quotes";

const plan = buildStoredPlan(ImportPayload.parse(examplePlanJson));
const acme = plan.positions.find((p) => p.ticker === "ACME")!;
const globex = plan.positions.find((p) => p.ticker === "GLOBEX")!;

function quote(ticker: string, price: number): Map<string, Quote> {
  return new Map([[ticker, { ticker, price, change: 0, percentChange: 0, prevClose: price }]]);
}
function statusFor(positions: typeof plan.positions, quotes: Map<string, Quote>, kind: string) {
  return evaluateTriggers(positions, quotes).filter((s) => s.trigger.kind === kind);
}

describe("evaluateTriggers", () => {
  it("fires ACME's buy zone when price is inside 15-16", () => {
    const s = statusFor([acme], quote("ACME", 15.5), "buy");
    expect(s[0].state).toBe("fired");
  });

  it("leaves ACME's buy zone clear when price is above it", () => {
    const s = statusFor([acme], quote("ACME", 20), "buy");
    expect(s[0].state).toBe("clear");
  });

  it("marks requires_manual triggers as manual (ACME weekly-close kill, reclaim)", () => {
    const all = evaluateTriggers([acme], quote("ACME", 20));
    const kill = all.find((s) => s.trigger.kind === "kill")!;
    const reclaim = all.find((s) => s.trigger.kind === "reclaim")!;
    expect(kill.state).toBe("manual");
    expect(reclaim.state).toBe("manual");
  });

  it("fires GLOBEX's spot kill below 25, near just above, clear well above", () => {
    expect(statusFor([globex], quote("GLOBEX", 24), "kill")[0].state).toBe("fired");
    expect(statusFor([globex], quote("GLOBEX", 25.5), "kill")[0].state).toBe("near");
    expect(statusFor([globex], quote("GLOBEX", 30), "kill")[0].state).toBe("clear");
  });

  it("returns manual when there is no quote for the ticker", () => {
    const s = statusFor([globex], new Map(), "kill");
    expect(s[0].state).toBe("manual");
    expect(s[0].message).toMatch(/no quote/i);
  });
});

describe("positionAccent", () => {
  it("is red when a kill is fired", () => {
    const s = evaluateTriggers([globex], quote("GLOBEX", 24));
    expect(positionAccent(s)).toBe("red");
  });
  it("is green when only a buy is fired", () => {
    const s = evaluateTriggers([acme], quote("ACME", 15.5));
    expect(positionAccent(s)).toBe("green");
  });
  it("is none when everything is clear or manual", () => {
    const s = evaluateTriggers([acme], quote("ACME", 20));
    expect(positionAccent(s)).toBe("none");
  });
});
