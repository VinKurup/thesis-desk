import { describe, it, expect } from "vitest";
import { isUsMarketOpen } from "./marketHours";

describe("isUsMarketOpen", () => {
  it("is open on a weekday at 10:00 ET", () => {
    expect(isUsMarketOpen(new Date("2026-06-15T14:00:00Z"))).toBe(true);
  });
  it("is closed before 09:30 ET", () => {
    expect(isUsMarketOpen(new Date("2026-06-15T13:00:00Z"))).toBe(false);
  });
  it("is open exactly at 09:30 ET", () => {
    expect(isUsMarketOpen(new Date("2026-06-15T13:30:00Z"))).toBe(true);
  });
  it("is closed exactly at 16:00 ET", () => {
    expect(isUsMarketOpen(new Date("2026-06-15T20:00:00Z"))).toBe(false);
  });
  it("is closed after 16:00 ET", () => {
    expect(isUsMarketOpen(new Date("2026-06-15T20:30:00Z"))).toBe(false);
  });
  it("is closed on Saturday", () => {
    expect(isUsMarketOpen(new Date("2026-06-13T14:00:00Z"))).toBe(false);
  });
});
