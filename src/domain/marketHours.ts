// US regular trading session only: Mon-Fri, 09:30-16:00 America/New_York.
// No holiday calendar (intentional — closed-day over-polling is harmless).
export function isUsMarketOpen(date: Date): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";

  const weekday = get("weekday"); // "Mon".."Sun"
  if (weekday === "Sat" || weekday === "Sun") return false;

  let hour = parseInt(get("hour"), 10);
  if (hour === 24) hour = 0; // some runtimes emit "24" for midnight with hour12:false
  const minutes = hour * 60 + parseInt(get("minute"), 10);
  return minutes >= 9 * 60 + 30 && minutes < 16 * 60;
}
