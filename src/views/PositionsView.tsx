import { StoredPlan } from "../domain/repository";
import { Quote } from "../domain/quotes";
import { TriggerStatus, positionAccent, PositionAccent } from "../domain/triggerEval";
import { PriceBadge } from "./PriceBadge";

const ACCENT_COLOR: Record<PositionAccent, string> = {
  red: "crimson",
  amber: "#d98800",
  green: "green",
  none: "#ddd",
};

export function PositionsView({
  plan,
  quotes = new Map(),
  statuses = [],
}: {
  plan: StoredPlan;
  quotes?: Map<string, Quote>;
  statuses?: TriggerStatus[];
}) {
  return (
    <div style={{ padding: 16, maxWidth: 900 }}>
      <h2>Positions</h2>
      {plan.positions.map((pos) => {
        const quote = quotes.get(pos.ticker);
        const posStatuses = statuses.filter((s) => s.positionId === pos.id);
        const accent = positionAccent(posStatuses);
        return (
          <div
            key={pos.id}
            style={{ border: `2px solid ${ACCENT_COLOR[accent]}`, borderRadius: 8, padding: 12, marginBottom: 16 }}
          >
            <h3>
              {pos.name} ({pos.ticker}) <PriceBadge quote={quote} /> —{" "}
              <span style={{ color: "#06c" }}>{pos.role}</span> · {pos.status}
            </h3>
            <p>{pos.thesis}</p>
            <p><strong>Structure:</strong> {pos.structure.text}</p>

            <strong>Tranches</strong>
            <table>
              <tbody>
                {pos.tranches.map((t, i) => (
                  <tr key={i}><td>{t.label}</td><td>{t.trigger_condition}</td><td>{t.size}</td></tr>
                ))}
              </tbody>
            </table>

            <p style={{ color: "crimson" }}><strong>KILL:</strong> {pos.kill_trigger}</p>

            {posStatuses.length > 0 && (
              <p style={{ fontSize: 13 }}>
                <strong>Triggers:</strong>{" "}
                {posStatuses.map((s, i) => (
                  <span key={i} style={{ marginRight: 10 }}>
                    {s.message}{i < posStatuses.length - 1 ? " ·" : ""}
                  </span>
                ))}
              </p>
            )}

            {pos.catalyst_confirm.length > 0 && (
              <>
                <strong>Catalyst — confirm</strong>
                <ul>{pos.catalyst_confirm.map((c, i) => <li key={i}>{c}</li>)}</ul>
              </>
            )}
            {pos.catalyst_kill.length > 0 && (
              <>
                <strong>Catalyst — kill</strong>
                <ul>{pos.catalyst_kill.map((c, i) => <li key={i}>{c}</li>)}</ul>
              </>
            )}
            {pos.monitors.length > 0 && (
              <p><strong>Monitors:</strong> {pos.monitors.join(" · ")}</p>
            )}
            {pos.bet_one_sentence && <p><em>{pos.bet_one_sentence}</em></p>}
            {pos.scenario_target && <p><strong>Target:</strong> {pos.scenario_target}</p>}
          </div>
        );
      })}
    </div>
  );
}
