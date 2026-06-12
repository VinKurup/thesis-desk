import { StoredPlan } from "../domain/repository";

export function PlanView({ plan }: { plan: StoredPlan }) {
  const p = plan.plan;
  return (
    <div style={{ padding: 16, maxWidth: 900 }}>
      <h2>{p.title}</h2>
      <p style={{ color: "#666" }}>{p.date} · {p.tagline}</p>
      <h3>Thesis</h3>
      <p>{p.thesis_narrative}</p>
      <h3>Methodology</h3>
      <ol>{p.methodology.map((m, i) => <li key={i}>{m}</li>)}</ol>
      <h3>Whole-thesis invalidation</h3>
      <ul>{p.invalidation_conditions.map((c, i) => <li key={i}>{c}</li>)}</ul>
      {p.source_url && <p><a href={p.source_url}>Source conversation</a></p>}
      {p.disclaimer && <p style={{ fontStyle: "italic", color: "#888" }}>{p.disclaimer}</p>}
    </div>
  );
}
