import { describe, it, expect } from "vitest";
import { smartImport } from "./smartImport";
import { ParseResult } from "../domain/import";
import { ImportPayload } from "../domain/schema";
import { examplePlanJson } from "../test/fixtures/examplePlan";

const validPayload = ImportPayload.parse(examplePlanJson);
const okParse: ParseResult = { ok: true, value: validPayload };
const badParse: ParseResult = { ok: false, error: "strict failed" };

describe("smartImport", () => {
  it("uses the strict path and never calls convert when input conforms", async () => {
    let converted = false;
    const r = await smartImport("raw", {
      parse: () => okParse,
      hasKey: true,
      convert: async () => { converted = true; return okParse; },
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.via).toBe("strict");
    expect(converted).toBe(false);
  });

  it("returns the strict error and does not convert when no key is set", async () => {
    let converted = false;
    const r = await smartImport("raw", {
      parse: () => badParse,
      hasKey: false,
      convert: async () => { converted = true; return okParse; },
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.stage).toBe("strict");
    expect(converted).toBe(false);
  });

  it("falls back to convert when strict fails and a key is present", async () => {
    const r = await smartImport("raw", {
      parse: () => badParse,
      hasKey: true,
      convert: async () => okParse,
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.via).toBe("llm");
  });

  it("reports an llm-stage error when conversion also fails", async () => {
    const r = await smartImport("raw", {
      parse: () => badParse,
      hasKey: true,
      convert: async () => ({ ok: false, error: "llm bad json" }),
    });
    expect(r.ok).toBe(false);
    if (!r.ok) { expect(r.stage).toBe("llm"); expect(r.error).toMatch(/llm bad json/); }
  });
});
