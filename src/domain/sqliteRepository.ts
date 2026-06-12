import { getDb } from "./db";
import {
  PlanRepository,
  StoredPlan,
  PlanSummary,
  buildStoredPlan,
} from "./repository";
import { ImportPayloadType } from "./schema";

export class SqlitePlanRepository implements PlanRepository {
  async savePlan(payload: ImportPayloadType): Promise<StoredPlan> {
    const db = await getDb();
    const stored = buildStoredPlan(payload);
    const now = new Date().toISOString();

    // create-or-update: delete any existing plan with the same title and its children
    const existing = await db.select<{ id: string }[]>(
      "SELECT id FROM plans WHERE title = $1",
      [payload.plan.title]
    );
    for (const row of existing) {
      await db.execute(
        "DELETE FROM triggers WHERE position_id IN (SELECT id FROM positions WHERE plan_id = $1)",
        [row.id]
      );
      await db.execute("DELETE FROM positions WHERE plan_id = $1", [row.id]);
      await db.execute("DELETE FROM watchlist_items WHERE plan_id = $1", [row.id]);
      await db.execute("DELETE FROM events WHERE plan_id = $1", [row.id]);
      await db.execute("DELETE FROM plans WHERE id = $1", [row.id]);
    }

    const p = stored.plan;
    await db.execute(
      `INSERT INTO plans (id,title,date,tagline,thesis_narrative,methodology,
         invalidation_conditions,disclaimer,source_url,created_at,updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [stored.id, p.title, p.date, p.tagline, p.thesis_narrative,
       JSON.stringify(p.methodology), JSON.stringify(p.invalidation_conditions),
       p.disclaimer, p.source_url, now, now]
    );

    for (let i = 0; i < stored.positions.length; i++) {
      const pos = stored.positions[i];
      await db.execute(
        `INSERT INTO positions (id,plan_id,ticker,name,role,status,thesis,structure,
           tranches,kill_trigger,catalyst_confirm,catalyst_kill,monitors,
           bet_one_sentence,scenario_target,sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
        [pos.id, stored.id, pos.ticker, pos.name, pos.role, pos.status, pos.thesis,
         JSON.stringify(pos.structure), JSON.stringify(pos.tranches), pos.kill_trigger,
         JSON.stringify(pos.catalyst_confirm), JSON.stringify(pos.catalyst_kill),
         JSON.stringify(pos.monitors), pos.bet_one_sentence, pos.scenario_target, i]
      );
      for (const t of pos.triggers) {
        // ticker is denormalized onto the trigger row so Phase 2 live evaluation
        // can query triggers by ticker without joining back to positions.
        await db.execute(
          `INSERT INTO triggers (id,position_id,ticker,comparator,price,price_low,
             price_high,timeframe,kind,requires_manual)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [t.id, pos.id, pos.ticker, t.comparator, t.price ?? null,
           t.price_low ?? null, t.price_high ?? null, t.timeframe, t.kind,
           t.requires_manual ? 1 : 0]
        );
      }
    }

    for (let i = 0; i < stored.watchlist.length; i++) {
      const w = stored.watchlist[i];
      await db.execute(
        `INSERT INTO watchlist_items (id,plan_id,ticker,price_note,narrative,needs,
           score,status,off_board_reason,sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [w.id, stored.id, w.ticker, w.price_note, w.narrative, w.needs, w.score,
         w.status, w.off_board_reason, i]
      );
    }

    for (let i = 0; i < stored.events.length; i++) {
      const e = stored.events[i];
      await db.execute(
        `INSERT INTO events (id,plan_id,date,description,ticker,type,sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [e.id, stored.id, e.date, e.description, e.ticker ?? null, e.type, i]
      );
    }

    return stored;
  }

  async getPlan(id: string): Promise<StoredPlan | null> {
    const db = await getDb();
    const planRows = await db.select<any[]>("SELECT * FROM plans WHERE id = $1", [id]);
    if (planRows.length === 0) return null;
    const pr = planRows[0];

    const posRows = await db.select<any[]>(
      "SELECT * FROM positions WHERE plan_id = $1 ORDER BY sort_order", [id]
    );
    const positions = [];
    for (const r of posRows) {
      const trigRows = await db.select<any[]>(
        "SELECT * FROM triggers WHERE position_id = $1", [r.id]
      );
      positions.push({
        id: r.id, ticker: r.ticker, name: r.name, role: r.role, status: r.status,
        thesis: r.thesis, structure: JSON.parse(r.structure),
        tranches: JSON.parse(r.tranches), kill_trigger: r.kill_trigger,
        catalyst_confirm: JSON.parse(r.catalyst_confirm),
        catalyst_kill: JSON.parse(r.catalyst_kill), monitors: JSON.parse(r.monitors),
        bet_one_sentence: r.bet_one_sentence, scenario_target: r.scenario_target,
        triggers: trigRows.map((t) => ({
          id: t.id, comparator: t.comparator, price: t.price ?? undefined,
          price_low: t.price_low ?? undefined, price_high: t.price_high ?? undefined,
          timeframe: t.timeframe, kind: t.kind, requires_manual: !!t.requires_manual,
        })),
      });
    }

    const wRows = await db.select<any[]>(
      "SELECT * FROM watchlist_items WHERE plan_id = $1 ORDER BY sort_order", [id]
    );
    const eRows = await db.select<any[]>(
      "SELECT * FROM events WHERE plan_id = $1 ORDER BY sort_order", [id]
    );

    return {
      id: pr.id,
      plan: {
        title: pr.title, date: pr.date, tagline: pr.tagline,
        thesis_narrative: pr.thesis_narrative,
        methodology: JSON.parse(pr.methodology),
        invalidation_conditions: JSON.parse(pr.invalidation_conditions),
        disclaimer: pr.disclaimer, source_url: pr.source_url,
      },
      positions,
      watchlist: wRows.map((w) => ({
        id: w.id, ticker: w.ticker, price_note: w.price_note, narrative: w.narrative,
        needs: w.needs, score: w.score, status: w.status,
        off_board_reason: w.off_board_reason,
      })),
      events: eRows.map((e) => ({
        id: e.id, date: e.date, description: e.description,
        ticker: e.ticker ?? undefined, type: e.type,
      })),
    };
  }

  async listPlans(): Promise<PlanSummary[]> {
    const db = await getDb();
    return db.select<PlanSummary[]>("SELECT id, title, date FROM plans ORDER BY date DESC");
  }
}
