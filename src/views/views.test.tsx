import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PositionsView } from "./PositionsView";
import { WatchlistView } from "./WatchlistView";
import { buildStoredPlan } from "../domain/repository";
import { ImportPayload } from "../domain/schema";
import { examplePlanJson } from "../test/fixtures/examplePlan";

const stored = buildStoredPlan(ImportPayload.parse(examplePlanJson));

describe("read-only views", () => {
  it("PositionsView lists every position ticker", () => {
    render(<PositionsView plan={stored} />);
    expect(screen.getByText(/Acme Robotics/)).toBeTruthy();
    expect(screen.getByText(/Globex Corp/)).toBeTruthy();
  });

  it("WatchlistView separates watching from off-board", () => {
    render(<WatchlistView plan={stored} />);
    expect(screen.getByText(/INITECH/)).toBeTruthy();
    expect(screen.getByText(/UMBRELLA/)).toBeTruthy();
    expect(screen.getByText(/Off board/i)).toBeTruthy();
  });
});
