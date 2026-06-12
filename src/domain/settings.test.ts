import { describe, it, expect } from "vitest";
import { InMemorySettingsRepository, FINNHUB_KEY } from "./settings";

describe("InMemorySettingsRepository", () => {
  it("returns null for an unset key", async () => {
    const repo = new InMemorySettingsRepository();
    expect(await repo.get(FINNHUB_KEY)).toBeNull();
  });

  it("stores and retrieves a value", async () => {
    const repo = new InMemorySettingsRepository();
    await repo.set(FINNHUB_KEY, "abc123");
    expect(await repo.get(FINNHUB_KEY)).toBe("abc123");
  });

  it("overwrites an existing value", async () => {
    const repo = new InMemorySettingsRepository();
    await repo.set(FINNHUB_KEY, "old");
    await repo.set(FINNHUB_KEY, "new");
    expect(await repo.get(FINNHUB_KEY)).toBe("new");
  });
});
