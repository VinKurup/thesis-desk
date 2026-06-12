import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PositionsView } from "./PositionsView";
import { buildStoredPlan } from "../domain/repository";
import { ImportPayload } from "../domain/schema";
import { examplePlanJson } from "../test/fixtures/examplePlan";
import { evaluateTriggers } from "../domain/triggerEval";
import { Quote } from "../domain/quotes";

const plan = buildStoredPlan(ImportPayload.parse(examplePlanJson));
const globex = plan.positions.find((p) => p.ticker === "GLOBEX")!;
const quotes = new Map<string, Quote>([
  ["GLOBEX", { ticker: "GLOBEX", price: 24, change: -1, percentChange: -4, prevClose: 25 }],
]);
const statuses = evaluateTriggers([globex], quotes);

describe("PositionsView live data", () => {
  it("shows the live price and a fired KILL status for GLOBEX", () => {
    render(<PositionsView plan={{ ...plan, positions: [globex] }} quotes={quotes} statuses={statuses} />);
    expect(screen.getByText(/24\.00/)).toBeTruthy();
    expect(screen.getByText(/KILL hit/i)).toBeTruthy();
  });
});
