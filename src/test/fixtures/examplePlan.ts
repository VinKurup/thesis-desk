// Illustrative, fully synthetic fixture — fake companies and round-number prices.
// Used only by tests to exercise every code path. Not a real trading thesis.
export const examplePlanJson = {
  plan: {
    title: "Example Trading Plan",
    date: "2026-01-15",
    tagline: "Sample thesis-driven playbook (illustrative only)",
    thesis_narrative:
      "An illustrative thesis: a sector is mispriced because the market is using a stale model, and a few names are set to re-rate as the headline metric catches up to the underlying trend.",
    methodology: [
      "Wrong model, not a bad business — multiple at multi-year lows while the core metric is stable or accelerating",
      "Reclassifying data already disclosed — segment acceleration shows up before the headline inflects",
      "Positioning offside — downgrades, downtrend, sold on good news",
      "Dated catalyst — an earnings print that forces a simultaneous re-marking",
    ],
    invalidation_conditions: [
      "A dominant incumbent bundles the capability away for free",
      "End-market adoption stalls and removes the urgency",
      "The broad sector reverses hard — the move was a squeeze, not a re-rating",
    ],
    disclaimer: "Illustrative example only — not financial advice.",
    source_url: "https://example.com/chat",
  },
  positions: [
    {
      ticker: "ACME",
      name: "Acme Robotics",
      role: "PRIMARY",
      status: "enterable",
      thesis:
        "Revenue and bookings accelerating while the multiple sits at a multi-year low after a small guidance miss. Bookings lead revenue, so recognition should catch up over the next few quarters.",
      structure: {
        text: "~70% shares + ~30% long-dated $15 calls",
        legs: [
          { kind: "share", quantity: 0, cost_basis: 20.0 },
          { kind: "call", strike: 15, expiry: "2028-01", delta: 0.85, cost_basis: 7.0 },
        ],
      },
      tranches: [
        { label: "T1", trigger_condition: "Now ~$20 (capitulation done)", size: "1/3" },
        { label: "T2", trigger_condition: "$15.00-16.00 (support retest)", size: "1/2" },
        { label: "T3", trigger_condition: "Reclaim $25.00 on volume (shares only above $22)", size: "rest" },
      ],
      kill_trigger: "Weekly close < $14.00 — exit and reassess. No averaging below the floor.",
      catalyst_confirm: [
        "Bookings growth >40%",
        "Backlog >=28% with gap over revenue intact",
        "Revenue >=21% (22%+ = inflection started)",
        "Any full-year guide raise",
      ],
      catalyst_kill: ["Bookings <20%", "Backlog converging to revenue", "Second guide cut"],
      monitors: ["Insider Form 4 buys", "Competitor call commentary", "Short interest"],
      bet_one_sentence:
        "Recognition catches up to bookings within three quarters and the multiple re-rates.",
      scenario_target: "$35 by Jan'28 — meaningful upside on shares, more on the calls",
      triggers: [
        { comparator: "<", price: 14.0, timeframe: "weekly_close", kind: "kill", requires_manual: true },
        { comparator: "between", price_low: 15.0, price_high: 16.0, timeframe: "spot", kind: "buy", requires_manual: false },
        { comparator: ">=", price: 25.0, timeframe: "spot", kind: "reclaim", requires_manual: true },
      ],
    },
    {
      ticker: "GLOBEX",
      name: "Globex Corp",
      role: "SECONDARY",
      status: "enterable",
      thesis: "Beat-and-raise sold off to ~$30. Segment growth inflecting while the headline still decelerates — earlier-stage version of the primary name.",
      structure: { text: "shares preferred (thin options)", legs: [{ kind: "share", quantity: 0, cost_basis: 30.0 }] },
      tranches: [{ label: "T1", trigger_condition: "Now ~$30", size: "starter" }],
      kill_trigger: "Spot < $25; surprise secondary offering below $28",
      catalyst_confirm: ["Segment growth >=30%", "Net new bookings growing q/q"],
      catalyst_kill: ["Segment growth <30%", "Surprise secondary below $28"],
      monitors: ["Regulatory filings for a secondary", "Large-holder Form 4s"],
      bet_one_sentence: "Segment inflecting; headline decelerating — earlier-stage entry.",
      scenario_target: "First leg = where the large holder starts selling, not analyst targets",
      triggers: [{ comparator: "<", price: 25.0, timeframe: "spot", kind: "kill", requires_manual: false }],
    },
  ],
  watchlist: [
    {
      ticker: "INITECH",
      price_note: "~$40 (-13% YTD)",
      narrative: "Bear case vs early product traction",
      needs: "One more quarter showing revenue from the new product, not just usage",
      score: "Half-score",
      status: "watching",
    },
    {
      ticker: "UMBRELLA",
      price_note: "",
      narrative: "Acquired — thesis confirmation, no longer tradeable",
      needs: "",
      score: "",
      status: "off_board",
      off_board_reason: "Acquired",
    },
  ],
  events: [
    { date: "2026-02-26", description: "ACME Q4 print — the main event", ticker: "ACME", type: "earnings" },
    { date: "2026-03-09", description: "GLOBEX Q4 (net new bookings direction)", ticker: "GLOBEX", type: "earnings" },
  ],
};
