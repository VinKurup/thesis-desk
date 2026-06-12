import { PlanRepository, StoredPlan } from "../domain/repository";
import { parseImport } from "../domain/import";

export interface PlanState {
  current: StoredPlan | null;
  loading: boolean;
}

export type ImportOutcome = { ok: true } | { ok: false; error: string };

export function createPlanStore(repo: PlanRepository) {
  let state: PlanState = { current: null, loading: false };
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((l) => l());
  const set = (next: Partial<PlanState>) => {
    state = { ...state, ...next };
    emit();
  };

  return {
    getState: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    async importText(raw: string): Promise<ImportOutcome> {
      const parsed = parseImport(raw);
      if (!parsed.ok) return { ok: false, error: parsed.error };
      set({ loading: true });
      const stored = await repo.savePlan(parsed.value);
      set({ current: stored, loading: false });
      return { ok: true };
    },
    async loadFirstPlan(): Promise<void> {
      set({ loading: true });
      const list = await repo.listPlans();
      if (list.length === 0) {
        set({ loading: false });
        return;
      }
      const plan = await repo.getPlan(list[0].id);
      set({ current: plan, loading: false });
    },
  };
}

export type PlanStore = ReturnType<typeof createPlanStore>;
