import { fetch } from "@tauri-apps/plugin-http";
import { HttpClient } from "./quotes";

export const tauriHttpClient: HttpClient = {
  async getJson(url: string): Promise<unknown> {
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
};
