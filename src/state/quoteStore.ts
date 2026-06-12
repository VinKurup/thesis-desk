import { SettingsRepository, FINNHUB_KEY } from "../domain/settings";
import { Quote } from "../domain/quotes";
import { evaluateTriggers, TriggerStatus } from "../domain/triggerEval";
import { StoredPosition, StoredWatchlistItem } from "../domain/repository";

export interface QuoteState {
  quotes: Map<string, Quote>;
  statuses: TriggerStatus[];
  lastUpdated: number | null;
  loading: boolean;
  error: string | null;
}

export type QuoteFetcher = (
  tickers: string[],
  apiKey: string
) => Promise<{ quotes: Map<string, Quote>; failed: string[] }>;

export interface QuoteStoreDeps {
  settings: SettingsRepository;
  fetchQuotes: QuoteFetcher;
  now?: () => number;
}

export function createQuoteStore({ settings, fetchQuotes, now = () => Date.now() }: QuoteStoreDeps) {
  let state: QuoteState = {
    quotes: new Map(), statuses: [], lastUpdated: null, loading: false, error: null,
  };
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((l) => l());
  const set = (next: Partial<QuoteState>) => { state = { ...state, ...next }; emit(); };
  let timer: ReturnType<typeof setInterval> | null = null;

  async function refresh(positions: StoredPosition[], watchlist: StoredWatchlistItem[]) {
    const apiKey = await settings.get(FINNHUB_KEY);
    if (!apiKey) {
      set({ error: "Add your Finnhub API key in Settings to see live prices.", loading: false });
      return;
    }
    const tickers = Array.from(
      new Set([...positions.map((p) => p.ticker), ...watchlist.map((w) => w.ticker)])
    );
    set({ loading: true, error: null });
    try {
      const { quotes, failed } = await fetchQuotes(tickers, apiKey);
      const statuses = evaluateTriggers(positions, quotes);
      set({
        quotes,
        statuses,
        lastUpdated: now(),
        loading: false,
        error: failed.length ? `No data for: ${failed.join(", ")}` : null,
      });
    } catch (e) {
      set({ loading: false, error: (e as Error).message || "Failed to fetch quotes" });
    }
  }

  return {
    getState: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    refresh,
    startPolling(
      getInputs: () => { positions: StoredPosition[]; watchlist: StoredWatchlistItem[] },
      intervalMs = 60000
    ) {
      this.stopPolling();
      timer = setInterval(() => {
        const { positions, watchlist } = getInputs();
        void refresh(positions, watchlist);
      }, intervalMs);
    },
    stopPolling() {
      if (timer) { clearInterval(timer); timer = null; }
    },
  };
}

export type QuoteStore = ReturnType<typeof createQuoteStore>;
