import { describe, it, expect } from "vitest";
import { InMemoryPlanRepository } from "./repository";
import { examplePlanJson } from "../test/fixtures/examplePlan";
import { ImportPayload } from "./schema";

function payload() {
  return ImportPayload.parse(examplePlanJson);
}

describe("InMemoryPlanRepository", () => {
  it("saves a plan and returns it with generated ids", async () => {
    const repo = new InMemoryPlanRepository();
    const stored = await repo.savePlan(payload());
    expect(stored.id).toBeTruthy();
    expect(stored.positions[0].id).toBeTruthy();
    expect(stored.positions).toHaveLength(2);
    expect(stored.watchlist).toHaveLength(2);
    expect(stored.events).toHaveLength(2);
  });

  it("getPlan returns the saved plan", async () => {
    const repo = new InMemoryPlanRepository();
    const stored = await repo.savePlan(payload());
    const got = await repo.getPlan(stored.id);
    expect(got?.plan.title).toBe("Example Trading Plan");
  });

  it("listPlans returns one entry per saved plan", async () => {
    const repo = new InMemoryPlanRepository();
    await repo.savePlan(payload());
    const list = await repo.listPlans();
    expect(list).toHaveLength(1);
    expect(list[0].title).toBe("Example Trading Plan");
  });

  it("re-importing a plan with the same title replaces it (create-or-update)", async () => {
    const repo = new InMemoryPlanRepository();
    await repo.savePlan(payload());
    await repo.savePlan(payload());
    const list = await repo.listPlans();
    expect(list).toHaveLength(1);
  });
});
