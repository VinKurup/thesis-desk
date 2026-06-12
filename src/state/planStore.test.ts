import { describe, it, expect } from "vitest";
import { createPlanStore } from "./planStore";
import { InMemoryPlanRepository } from "../domain/repository";
import { examplePlanJson } from "../test/fixtures/examplePlan";
import { ImportPayload } from "../domain/schema";

describe("planStore", () => {
  it("imports valid text and exposes the stored plan", async () => {
    const store = createPlanStore(new InMemoryPlanRepository());
    const result = await store.importText(JSON.stringify(examplePlanJson));
    expect(result.ok).toBe(true);
    expect(store.getState().current?.plan.title).toBe("Example Trading Plan");
  });

  it("returns an error and leaves state unchanged on invalid text", async () => {
    const store = createPlanStore(new InMemoryPlanRepository());
    const result = await store.importText("{ bad json");
    expect(result.ok).toBe(false);
    expect(store.getState().current).toBeNull();
  });

  it("loadFirstPlan loads a previously saved plan", async () => {
    const repo = new InMemoryPlanRepository();
    const store = createPlanStore(repo);
    await store.importText(JSON.stringify(examplePlanJson));
    const store2 = createPlanStore(repo);
    await store2.loadFirstPlan();
    expect(store2.getState().current?.plan.title).toBe("Example Trading Plan");
  });

  it("applyImport persists a validated payload and sets current", async () => {
    const store = createPlanStore(new InMemoryPlanRepository());
    await store.applyImport(ImportPayload.parse(examplePlanJson));
    expect(store.getState().current?.plan.title).toBe("Example Trading Plan");
  });
});
