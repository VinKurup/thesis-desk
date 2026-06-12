import { StoredPlan } from "../domain/repository";

export function CalendarView({ plan }: { plan: StoredPlan }) {
  const events = [...plan.events].sort((a, b) => a.date.localeCompare(b.date));
  return (
    <div style={{ padding: 16, maxWidth: 900 }}>
      <h2>Calendar</h2>
      <table>
        <tbody>
          {events.map((e) => (
            <tr key={e.id}>
              <td style={{ whiteSpace: "nowrap", paddingRight: 12 }}>{e.date}</td>
              <td>{e.ticker ? `${e.ticker}: ` : ""}{e.description}</td>
              <td style={{ color: "#888", paddingLeft: 12 }}>{e.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
