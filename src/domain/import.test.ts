import { describe, it, expect } from "vitest";
import { parseImport } from "./import";
import { examplePlanJson } from "../test/fixtures/examplePlan";

describe("parseImport", () => {
  it("parses a bare JSON object", () => {
    const r = parseImport(JSON.stringify(examplePlanJson));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.plan.title).toBe("Example Trading Plan");
      expect(r.value.positions).toHaveLength(2);
      expect(r.value.positions[0].triggers).toHaveLength(3);
    }
  });

  it("extracts JSON from a fenced markdown block", () => {
    const wrapped = "Here is the plan:\n\n```json\n" + JSON.stringify(examplePlanJson) + "\n```\n\nDone.";
    const r = parseImport(wrapped);
    expect(r.ok).toBe(true);
  });

  it("returns an error for invalid JSON syntax", () => {
    const r = parseImport("{ not valid json ");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/JSON/i);
  });

  it("returns a validation error for a schema-invalid payload", () => {
    const r = parseImport(JSON.stringify({ plan: { title: "x" }, positions: [] }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.length).toBeGreaterThan(0);
  });
});
