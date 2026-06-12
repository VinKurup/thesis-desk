export interface Quote {
  ticker: string;
  price: number;
  change: number;
  percentChange: number;
  prevClose: number;
}

export interface HttpClient {
  getJson(url: string): Promise<unknown>;
}

export interface FetchQuotesResult {
  quotes: Map<string, Quote>;
  failed: string[];
}

const FINNHUB_QUOTE_URL = "https://finnhub.io/api/v1/quote";

export async function fetchQuotes(
  tickers: string[],
  apiKey: string,
  http: HttpClient
): Promise<FetchQuotesResult> {
  const quotes = new Map<string, Quote>();
  const failed: string[] = [];
  for (const ticker of tickers) {
    try {
      const url =
        `${FINNHUB_QUOTE_URL}?symbol=${encodeURIComponent(ticker)}&token=${encodeURIComponent(apiKey)}`;
      const data = (await http.getJson(url)) as {
        c?: number; d?: number; dp?: number; pc?: number;
      };
      if (!data || typeof data.c !== "number" || data.c === 0) {
        failed.push(ticker);
        continue;
      }
      quotes.set(ticker, {
        ticker,
        price: data.c,
        change: data.d ?? 0,
        percentChange: data.dp ?? 0,
        prevClose: data.pc ?? 0,
      });
    } catch {
      failed.push(ticker);
    }
  }
  return { quotes, failed };
}
