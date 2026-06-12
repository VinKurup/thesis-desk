import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SettingsView } from "./SettingsView";
import { InMemorySettingsRepository } from "../domain/settings";

describe("SettingsView", () => {
  it("renders Finnhub and OpenRouter fields", () => {
    render(<SettingsView settings={new InMemorySettingsRepository()} onSaved={() => {}} />);
    expect(screen.getByText(/Finnhub API key/i)).toBeTruthy();
    expect(screen.getByText(/OpenRouter API key/i)).toBeTruthy();
    expect(screen.getByText(/model/i)).toBeTruthy();
  });
});
