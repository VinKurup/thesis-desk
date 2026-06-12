import Database from "@tauri-apps/plugin-sql";

let dbPromise: Promise<Database> | null = null;

const MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS plans (
     id TEXT PRIMARY KEY, title TEXT NOT NULL, date TEXT, tagline TEXT,
     thesis_narrative TEXT, methodology TEXT, invalidation_conditions TEXT,
     disclaimer TEXT, source_url TEXT, created_at TEXT, updated_at TEXT);`,
  `CREATE TABLE IF NOT EXISTS positions (
     id TEXT PRIMARY KEY, plan_id TEXT, ticker TEXT, name TEXT, role TEXT, status TEXT,
     thesis TEXT, structure TEXT, tranches TEXT, kill_trigger TEXT,
     catalyst_confirm TEXT, catalyst_kill TEXT, monitors TEXT,
     bet_one_sentence TEXT, scenario_target TEXT, sort_order INTEGER);`,
  `CREATE TABLE IF NOT EXISTS triggers (
     id TEXT PRIMARY KEY, position_id TEXT, ticker TEXT, comparator TEXT,
     price REAL, price_low REAL, price_high REAL, timeframe TEXT, kind TEXT,
     requires_manual INTEGER);`,
  `CREATE TABLE IF NOT EXISTS watchlist_items (
     id TEXT PRIMARY KEY, plan_id TEXT, ticker TEXT, price_note TEXT, narrative TEXT,
     needs TEXT, score TEXT, status TEXT, off_board_reason TEXT, sort_order INTEGER);`,
  `CREATE TABLE IF NOT EXISTS events (
     id TEXT PRIMARY KEY, plan_id TEXT, date TEXT, description TEXT, ticker TEXT,
     type TEXT, sort_order INTEGER);`,
];

export async function getDb(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await Database.load("sqlite:trading.db");
      for (const m of MIGRATIONS) await db.execute(m);
      return db;
    })();
  }
  return dbPromise;
}
