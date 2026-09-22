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
  components/         shared, reused across the one page
    TopBar, PageHeader, ItemList, ItemDetail, CopyButton, viz
  views/
    HorizonScanning.tsx   the one page: stats + category mix + master-detail
  lib/
    uiTokens.ts         all colour, enumerated (see docs/DESIGN.md)
    ui.tsx              Panel/Badge/Stat/SectionHeading/EmptyState
    digest.ts           the weekly "what moved" markdown, + scripts/digest.ts
    export.ts           citation text + clipboard side-effect
    insights.ts          pure derivations (categoryMix)
    utils.ts             cn(), relativeDay(), longDate(), withinDays()
  App.tsx               renders TopBar + the one page, no routing/page state
```

## State

Horizon is a single page — there is no router and no `page` state.
`App.tsx` just passes `ALL_ITEMS` into `HorizonScanning`, which owns the
master-detail selection itself: `selectedId` (which item's detail is
showing on the right) and `mobileShowDetail` (which side is visible below
the `lg` breakpoint, where the two columns stack). `ItemList` owns its own
search query and sort direction, and falls back to selecting the most
recent visible row whenever the current selection filters out of view.

## Content flow

```
items.ts (human-curated, starts empty)  ─┐
                                          ├─▶ content/index.ts dedupes by id ─▶ ALL_ITEMS
feed.json (agent-appended)              ─┘
```

Views never read `items.ts` or `feed.json` directly — always `ALL_ITEMS`
from `content/index.ts`. That is the one place merge/dedupe logic lives.

## Four regimes, one filter

There is no per-regime view or route. `HorizonScanning` filters `ALL_ITEMS`
to a `regime: Regime | "all"` pill state and passes the result into
`ItemList`. Adding a fifth regime later (unlikely, given the brief is
intentionally fixed to UK/US/EU/UN) means one more `REGIME_META` entry in
`taxonomy.ts` and one more pill — never a new view file.

## Reuse discipline

`ItemList` and `ItemDetail` are the two surfaces the one page renders items
through — a selectable master list on the left, the full detail of
whichever item is selected on the right. `ItemDetail` is composed of
exactly three sections in a fixed order: Source Classification, Executive
Summary, Designated Entities (omitted when an item has none). A new surface
should compose these plus `Panel`/`Stat`/`SectionHeading` from
`lib/ui.tsx`, not invent new list or card markup.

## Master-detail responsiveness

Below the `lg` breakpoint there isn't room for both columns, so
`HorizonScanning` stacks them: the list is full-width by default, and
selecting a row (`userInitiated: true` from `ItemList`) swaps in the detail
pane with a "Back to list" affordance. At `lg` and above both columns are
always visible side by side, and the mobile stacking classes are inert.
