import { describe, it, expect } from "vitest";
import { TEMPLATE_PROMPT, EXTRACTION_PROMPT } from "./prompts";

describe("prompts", () => {
  it("template prompt mentions the json fence and key entities", () => {
    expect(TEMPLATE_PROMPT).toMatch(/```json/);
    expect(TEMPLATE_PROMPT).toMatch(/positions/);
    expect(TEMPLATE_PROMPT).toMatch(/triggers/);
  });
  it("extraction prompt instructs conversion of an existing conversation", () => {
    expect(EXTRACTION_PROMPT).toMatch(/conversation/i);
    expect(EXTRACTION_PROMPT).toMatch(/```json/);
  });
});
