import {
  ImportPayloadType,
  Position,
  WatchlistItem,
  CalendarEvent,
  Trigger,
  PlanMeta,
} from "./schema";

export interface StoredTrigger extends Trigger {
  id: string;
}
export interface StoredPosition extends Omit<Position, "triggers"> {
  id: string;
  triggers: StoredTrigger[];
}
export interface StoredWatchlistItem extends WatchlistItem {
  id: string;
}
export interface StoredEvent extends CalendarEvent {
  id: string;
}
export interface StoredPlan {
  id: string;
  plan: PlanMeta;
  positions: StoredPosition[];
  watchlist: StoredWatchlistItem[];
  events: StoredEvent[];
}
export interface PlanSummary {
  id: string;
  title: string;
  date: string;
}

export interface PlanRepository {
  savePlan(payload: ImportPayloadType): Promise<StoredPlan>;
  getPlan(id: string): Promise<StoredPlan | null>;
  listPlans(): Promise<PlanSummary[]>;
}

const newId = () => crypto.randomUUID();

/** Convert a validated payload into a StoredPlan with generated ids. */
export function buildStoredPlan(payload: ImportPayloadType): StoredPlan {
  return {
    id: newId(),
    plan: payload.plan,
    positions: payload.positions.map((p) => ({
      ...p,
      id: newId(),
      triggers: p.triggers.map((t) => ({ ...t, id: newId() })),
    })),
    watchlist: payload.watchlist.map((w) => ({ ...w, id: newId() })),
    events: payload.events.map((e) => ({ ...e, id: newId() })),
  };
}

export class InMemoryPlanRepository implements PlanRepository {
  private plans = new Map<string, StoredPlan>();

  async savePlan(payload: ImportPayloadType): Promise<StoredPlan> {
    for (const [id, existing] of this.plans) {
      if (existing.plan.title === payload.plan.title) this.plans.delete(id);
    }
    const stored = buildStoredPlan(payload);
    this.plans.set(stored.id, stored);
    return stored;
  }

  async getPlan(id: string): Promise<StoredPlan | null> {
    return this.plans.get(id) ?? null;
  }

  async listPlans(): Promise<PlanSummary[]> {
    return [...this.plans.values()].map((p) => ({
      id: p.id,
      title: p.plan.title,
      date: p.plan.date,
    }));
  }
}
