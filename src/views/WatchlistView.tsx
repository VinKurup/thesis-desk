import { StoredPlan } from "../domain/repository";
import { Quote } from "../domain/quotes";

export function WatchlistView({
  plan,
}: {
  plan: StoredPlan;
  quotes?: Map<string, Quote>;
}) {
  const watching = plan.watchlist.filter((w) => w.status === "watching");
  const offBoard = plan.watchlist.filter((w) => w.status === "off_board");
  return (
    <div style={{ padding: 16, maxWidth: 900 }}>
      <h2>Watchlist</h2>
      {watching.map((w) => (
        <div key={w.id} style={{ borderBottom: "1px solid #eee", padding: "8px 0" }}>
          <strong>{w.ticker}</strong> {w.price_note} {w.score && <em>· {w.score}</em>}
          <div>{w.narrative}</div>
          {w.needs && <div style={{ color: "#666" }}>Needs: {w.needs}</div>}
        </div>
      ))}
      <h3 style={{ marginTop: 16 }}>Off board</h3>
      {offBoard.map((w) => (
        <div key={w.id} style={{ color: "#888", padding: "4px 0" }}>
          <strong>{w.ticker}</strong> — {w.off_board_reason || w.narrative}
        </div>
      ))}
    </div>
  );
}
