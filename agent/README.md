# Horizon ingestion agent

The agent is what makes Horizon routinely updated. It **monitors → classifies
→ drafts → publishes**, autonomously. There is **no human-in-the-loop gate**:
items go straight to `published`. The [Activity](../web/src/views/Activity.tsx)
view is a transparency log of what it shipped. Nothing waits there for
approval.

> **The one guardrail that replaces the human:** every auto-published item
> **must carry a real source URL** and **summarise-and-link** (never invent
> specifics). If the agent can't cite it, it doesn't publish it. This is a
> harder line here than in a general news tracker: a fabricated designation
> or delisting is not a cosmetic error for a bank's sanctions team, it is a
> compliance risk.

## The loop

```
 sources.ts ─▶ scan the fixed 24-source registry (no open-web discovery)
                                  │
                                  ▼
                 dedupe (vs existing ids/titles)
                                  │
                                  ▼
                 draft Item { status: "published", addedBy: "agent",
                              whyItMatters, nextStep, sources:[{url}] }
                                  │
                                  ▼
            append to web/src/content/feed.json  +  bump lastUpdated
                                  │
                                  ▼
            merged by content/index.ts → live in the regime tabs + Feed
                                  ▼
                 Activity view = transparency log
```

The agent writes **`web/src/content/feed.json`** (plain JSON, safe to
append, clean provenance), **not** `items.ts` (that stays the hand-seeded
baseline for anything a human wants to curate directly). The exact,
repeatable run is specified in [`INGEST.md`](INGEST.md).

## Output contract (the `Item` type)

Each item must:

- be a valid [`Item`](../web/src/content/types.ts) with `status: "published"`,
  `addedBy: "agent"`, and today's `addedAt`;
- include **at least one `source` with a URL** (hard requirement);
- carry `regime` (UK/US/EU/UN) and `category` (action / regulatory-update /
  geopolitical);
- carry **`whyItMatters`** (the bank financial-crime lens) and a `nextStep`
  flag, explicitly labelled a starting point, never a compliance
  determination;
- for lower-confidence items, set `confidence: "low"` or `"medium"` and say
  so in the `summary`;
- **never set `verified`**: that flag is a human vouch only. The agent
  publishes unverified; a human marks `verified: true` when they vouch.

## Scheduling

A daily run is a natural **scheduled routine** (cron). Because `feed.json`
is git-versioned, every run is an auditable diff. Two ways to run it:

| Mode | How | Notes |
|---|---|---|
| **Remote routine** | Push this repo to GitHub, then a scheduled agent runs [`INGEST.md`](INGEST.md) and commits `feed.json` | Runs even when the laptop is off; needs the repo on GitHub |
| **Local** | A local scheduled task runs the ingest prompt against the working copy | Simpler; only runs when this machine is on |

See [`INGEST.md`](INGEST.md) for the exact prompt the schedule executes.

## Source registry

See [`sources.ts`](sources.ts): 24 sources across the UK, US, EU and UN
regimes, exactly as specified — this list is intentionally exhaustive and
authoritative for the use case, not a starting point to expand from. Each
source carries a `regime` tag, a `sourceType` (primary-list / guidance /
enforcement / legislation / press-political) and the specific extraction
focus to pull from it. Review and update this list periodically; do not add
other sources without deliberately revisiting scope.
