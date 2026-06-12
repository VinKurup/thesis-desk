import { describe, it, expect } from "vitest";
import { convertToPlan, buildConversionPrompt } from "./llmConvert";
import { LlmClient } from "./llm";
import { examplePlanJson } from "../test/fixtures/examplePlan";

function fixedClient(reply: string): LlmClient {
  return { async complete() { return reply; } };
}

describe("buildConversionPrompt", () => {
  it("includes the schema markers and the raw text", () => {
    const p = buildConversionPrompt("MY PLAN TEXT");
    expect(p).toMatch(/positions/);
    expect(p).toMatch(/triggers/);
    expect(p).toMatch(/MY PLAN TEXT/);
  });
});

describe("convertToPlan", () => {
  it("validates a model reply that contains a conforming json block", async () => {
    const reply = "Sure:\n```json\n" + JSON.stringify(examplePlanJson) + "\n```";
    const r = await convertToPlan("anything", fixedClient(reply));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.plan.title).toBe("Example Trading Plan");
  });

  it("returns an error when the model reply does not conform", async () => {
    const r = await convertToPlan("anything", fixedClient('```json\n{"plan":"x"}\n```'));
    expect(r.ok).toBe(false);
  });
});
