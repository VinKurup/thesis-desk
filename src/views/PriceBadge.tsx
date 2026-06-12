import { Quote } from "../domain/quotes";

export function PriceBadge({ quote }: { quote?: Quote }) {
  if (!quote) return <span style={{ color: "#999" }}>—</span>;
  const up = quote.percentChange >= 0;
  return (
    <span style={{ color: up ? "green" : "crimson", fontWeight: "normal" }}>
      ${quote.price.toFixed(2)} ({up ? "+" : ""}{quote.percentChange.toFixed(2)}%)
    </span>
  );
}
