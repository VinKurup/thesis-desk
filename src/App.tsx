import { useEffect, useMemo, useState } from "react";
import { createPlanStore } from "./state/planStore";
import { SqlitePlanRepository } from "./domain/sqliteRepository";
import { ImportView } from "./views/ImportView";
import { PlanView } from "./views/PlanView";
import { PositionsView } from "./views/PositionsView";
import { WatchlistView } from "./views/WatchlistView";
import { CalendarView } from "./views/CalendarView";

type Tab = "plan" | "positions" | "watchlist" | "calendar" | "import";

export default function App() {
  const store = useMemo(() => createPlanStore(new SqlitePlanRepository()), []);
  const [, force] = useState(0);
  const [tab, setTab] = useState<Tab>("plan");

  useEffect(() => {
    const unsub = store.subscribe(() => force((n) => n + 1));
    store.loadFirstPlan();
    return () => { unsub(); };
  }, [store]);

  const { current } = store.getState();
  const tabs: Tab[] = ["plan", "positions", "watchlist", "calendar", "import"];

  return (
    <div>
      <nav style={{ display: "flex", gap: 8, padding: 8, borderBottom: "1px solid #ddd" }}>
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ fontWeight: tab === t ? "bold" : "normal" }}>{t}</button>
        ))}
      </nav>
      {!current && tab !== "import" && (
        <p style={{ padding: 16 }}>No plan loaded. Go to <strong>import</strong> to add one.</p>
      )}
      {tab === "import" && <ImportView store={store} />}
      {current && tab === "plan" && <PlanView plan={current} />}
      {current && tab === "positions" && <PositionsView plan={current} />}
      {current && tab === "watchlist" && <WatchlistView plan={current} />}
      {current && tab === "calendar" && <CalendarView plan={current} />}
    </div>
  );
}
