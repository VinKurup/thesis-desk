import { StoredPosition, StoredTrigger } from "./repository";
import { Quote } from "./quotes";

export type TriggerState = "fired" | "near" | "clear" | "manual";

export interface TriggerStatus {
  positionId: string;
  ticker: string;
  trigger: StoredTrigger;
  state: TriggerState;
  message: string;
}

export const NEAR_THRESHOLD = 0.05;

function conditionMet(t: StoredTrigger, price: number): boolean {
  switch (t.comparator) {
    case "<": return price < (t.price ?? Infinity);
    case "<=": return price <= (t.price ?? Infinity);
    case ">": return price > (t.price ?? -Infinity);
    case ">=": return price >= (t.price ?? -Infinity);
    case "between":
      return price >= (t.price_low ?? Infinity) && price <= (t.price_high ?? -Infinity);
    default: return false;
  }
}

// not yet crossed, but within NEAR_THRESHOLD on the breach side
function killNear(t: StoredTrigger, price: number): boolean {
  const p = t.price ?? 0;
  if (t.comparator === "<" || t.comparator === "<=") {
    return price >= p && price <= p * (1 + NEAR_THRESHOLD);
  }
  if (t.comparator === ">" || t.comparator === ">=") {
    return price <= p && price >= p * (1 - NEAR_THRESHOLD);
  }
  return false;
}

export function evaluateTriggers(
  positions: StoredPosition[],
  quotes: Map<string, Quote>
): TriggerStatus[] {
  const out: TriggerStatus[] = [];
  for (const pos of positions) {
    for (const trigger of pos.triggers) {
      const base = { positionId: pos.id, ticker: pos.ticker, trigger };
      if (trigger.requires_manual) {
        out.push({ ...base, state: "manual", message: "Manual review" });
        continue;
      }
      const quote = quotes.get(pos.ticker);
      if (!quote) {
        out.push({ ...base, state: "manual", message: "No quote yet" });
        continue;
      }
      const price = quote.price;
      if (trigger.kind === "kill") {
        if (conditionMet(trigger, price)) out.push({ ...base, state: "fired", message: "KILL hit" });
        else if (killNear(trigger, price)) out.push({ ...base, state: "near", message: "Approaching KILL" });
        else out.push({ ...base, state: "clear", message: "Clear" });
      } else if (trigger.kind === "buy") {
        if (conditionMet(trigger, price)) out.push({ ...base, state: "fired", message: "In buy zone" });
        else out.push({ ...base, state: "clear", message: "Clear" });
      } else {
        // reclaim, not manual
        if (conditionMet(trigger, price)) out.push({ ...base, state: "fired", message: "Reclaimed" });
        else out.push({ ...base, state: "clear", message: "Clear" });
      }
    }
  }
  return out;
}

export type PositionAccent = "red" | "amber" | "green" | "none";

export function positionAccent(statuses: TriggerStatus[]): PositionAccent {
  if (statuses.some((s) => s.state === "fired" && s.trigger.kind === "kill")) return "red";
  if (statuses.some((s) => s.state === "near" && s.trigger.kind === "kill")) return "amber";
  if (statuses.some((s) => s.state === "fired" && s.trigger.kind === "buy")) return "green";
  return "none";
}
