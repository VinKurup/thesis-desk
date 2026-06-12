import { fetch } from "@tauri-apps/plugin-http";
import { LlmClient } from "./llm";
import {
  SettingsRepository,
  OPENROUTER_KEY,
  OPENROUTER_MODEL,
  DEFAULT_OPENROUTER_MODEL,
} from "./settings";

export function createOpenRouterClient(settings: SettingsRepository): LlmClient {
  return {
    async complete(prompt: string): Promise<string> {
      const apiKey = await settings.get(OPENROUTER_KEY);
      if (!apiKey) throw new Error("No OpenRouter API key set — add one in Settings.");
      const model = (await settings.get(OPENROUTER_MODEL)) || DEFAULT_OPENROUTER_MODEL;
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) throw new Error(`OpenRouter HTTP ${res.status}`);
      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("OpenRouter returned no content.");
      return content;
    },
  };
}
