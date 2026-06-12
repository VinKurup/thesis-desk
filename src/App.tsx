import { useEffect, useMemo, useState } from "react";
import { createPlanStore } from "./state/planStore";
import { createQuoteStore } from "./state/quoteStore";
import { SqlitePlanRepository } from "./domain/sqliteRepository";
import { SqliteSettingsRepository } from "./domain/sqliteSettings";
import { fetchQuotes } from "./domain/quotes";
import { tauriHttpClient } from "./domain/tauriHttp";
import { ImportView } from "./views/ImportView";
import { SettingsView } from "./views/SettingsView";
import { PlanView } from "./views/PlanView";
import { PositionsView } from "./views/PositionsView";
import { WatchlistView } from "./views/WatchlistView";
import { CalendarView } from "./views/CalendarView";

type Tab = "plan" | "positions" | "watchlist" | "calendar" | "import" | "settings";

export default function App() {
  const settingsRepo = useMemo(() => new SqliteSettingsRepository(), []);
  const planStore = useMemo(() => createPlanStore(new SqlitePlanRepository()), []);
  const quoteStore = useMemo(
    () =>
      createQuoteStore({
        settings: settingsRepo,
        fetchQuotes: (tickers, apiKey) => fetchQuotes(tickers, apiKey, tauriHttpClient),
      }),
    [settingsRepo]
  );

  const [, force] = useState(0);
  const [tab, setTab] = useState<Tab>("plan");
  const [, tick] = useState(0);

  useEffect(() => {
    const unsubPlan = planStore.subscribe(() => force((n) => n + 1));
    const unsubQuote = quoteStore.subscribe(() => force((n) => n + 1));
    planStore.loadFirstPlan();
    return () => { unsubPlan(); unsubQuote(); };
  }, [planStore, quoteStore]);

  const current = planStore.getState().current;

  // when a plan is loaded, fetch quotes and start polling
  useEffect(() => {
    if (!current) return;
    const getInputs = () => ({ positions: current.positions, watchlist: current.watchlist });
    quoteStore.refresh(current.positions, current.watchlist);
    quoteStore.startPolling(getInputs);
    return () => quoteStore.stopPolling();
  }, [current, quoteStore]);

  // re-render every second so "updated Ns ago" stays current
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const qs = quoteStore.getState();
  const updatedAgo =
    qs.lastUpdated != null ? `updated ${Math.round((Date.now() - qs.lastUpdated) / 1000)}s ago` : "";

  const tabs: Tab[] = ["plan", "positions", "watchlist", "calendar", "import", "settings"];

  return (
    <div>
      <nav style={{ display: "flex", gap: 8, padding: 8, borderBottom: "1px solid #ddd", alignItems: "center" }}>
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ fontWeight: tab === t ? "bold" : "normal" }}>
            {t}
          </button>
        ))}
        <span style={{ marginLeft: "auto", color: "#888", fontSize: 12 }}>{updatedAgo}</span>
        <button onClick={() => current && quoteStore.refresh(current.positions, current.watchlist)}>
          Refresh
        </button>
      </nav>
      {qs.error && <p style={{ padding: "4px 16px", color: "crimson", margin: 0 }}>{qs.error}</p>}

      {!current && tab !== "import" && tab !== "settings" && (
        <p style={{ padding: 16 }}>No plan loaded. Go to <strong>import</strong> to add one.</p>
      )}
      {tab === "import" && <ImportView store={planStore} />}
      {tab === "settings" && (
        <SettingsView
          settings={settingsRepo}
          onSaved={() => current && quoteStore.refresh(current.positions, current.watchlist)}
        />
      )}
      {current && tab === "plan" && <PlanView plan={current} />}
      {current && tab === "positions" && (
        <PositionsView plan={current} quotes={qs.quotes} statuses={qs.statuses} />
      )}
      {current && tab === "watchlist" && <WatchlistView plan={current} quotes={qs.quotes} />}
      {current && tab === "calendar" && <CalendarView plan={current} />}
    </div>
  );
}
