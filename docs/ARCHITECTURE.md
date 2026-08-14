# Architecture

## File map

```
agent/
  sources.ts        the fixed 24-source registry (UK/US/EU/UN)
  INGEST.md          the exact, repeatable ingestion run spec
  README.md          the agent's auto-publish contract

web/src/
  content/
    types.ts         the Item schema — the one content model
    taxonomy.ts       label/icon/tone metadata per regime & category
    items.ts          hand-seeded baseline (empty by design, see CONTENT.md)
    feed.json          agent-published items, append-only
    index.ts          merges items.ts + feed.json → ALL_ITEMS
  components/         shared, reused across every view
    Sidebar, PageHeader, DataTable, ItemDetail, ItemCard, CopyButton, viz
  views/
    Overview.tsx       the command centre
    Feed.tsx            combined, regime-filterable table
    Regime.tsx          one component, mounted per regime (UK/US/EU/UN)
    Activity.tsx        transparency log of agent publishes
  lib/
    uiTokens.ts         all colour, enumerated (see docs/DESIGN.md)
    ui.tsx              Panel/Badge/Stat/SectionHeading/EmptyState
    digest.ts           the weekly "what moved" markdown, + scripts/digest.ts
    export.ts           citation text + clipboard/download side-effects
    insights.ts          pure derivations (countBy, categoryMix)
    utils.ts             cn(), relativeDay(), longDate(), withinDays()
  App.tsx               page state + routing (no router library, just useState)
```

## State

`App.tsx` holds a single `page: Page` state (`"overview" | "feed" | "UK" |
"US" | "EU" | "UN" | "activity"`) and passes `ALL_ITEMS` down. There is no
router and no per-item selection state at the App level — each view manages
its own local UI state (search query, sort, open rows) via `useState` in
`DataTable`.

## Content flow

```
items.ts (human-curated, starts empty)  ─┐
                                          ├─▶ content/index.ts dedupes by id ─▶ ALL_ITEMS
feed.json (agent-appended)              ─┘
```

Views never read `items.ts` or `feed.json` directly — always `ALL_ITEMS`
from `content/index.ts`. That is the one place merge/dedupe logic lives.

## One component, four regimes

`views/Regime.tsx` is not duplicated per regime. It takes a `regime` prop
and filters `ALL_ITEMS` to that regime; `App.tsx` mounts it once per nav
entry. Adding a fifth regime later (unlikely, given the brief is
intentionally fixed to UK/US/EU/UN) means one more `REGIME_META` entry in
`taxonomy.ts`, one more `Page` union member, and one more nav row — never a
new view file.

## Reuse discipline

`DataTable` and `ItemDetail` are the two surfaces every view renders items
through. A new view should compose these plus `Panel`/`Stat`/
`SectionHeading` from `lib/ui.tsx`, not invent new table or card markup.
