export const FINNHUB_KEY = "finnhub_api_key";
export const OPENROUTER_KEY = "openrouter_api_key";
export const OPENROUTER_MODEL = "openrouter_model";
export const DEFAULT_OPENROUTER_MODEL = "anthropic/claude-3.5-haiku";

export interface SettingsRepository {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
}

export class InMemorySettingsRepository implements SettingsRepository {
  private store = new Map<string, string>();
  async get(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }
  async set(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }
}
