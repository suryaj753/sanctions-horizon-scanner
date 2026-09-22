# Design system

## Identity

White / `neutral-50` base, a single muted **teal** accent
(`teal-600`/`teal-700`), amber/rose reserved for the next-step flag only
(`review-screening-lists` reads rose, `assess-framework-impact` reads
amber, `monitor-only` reads neutral). This is deliberately calmer than both
sibling apps — the Compliance Engine (light + blue) and Sentinel (dark +
violet) — because Horizon is a working reference for a compliance team, not
a dashboard that needs to hold attention.

## Where colour lives

`web/src/lib/uiTokens.ts` is the single source of truth for every coloured
class string (`ACCENT`, `TONE`, per-tone tile/text/dot/bar). Tailwind v4
scans source files for literal class strings, so colour is never built by
string interpolation (`` `bg-${tone}-500` `` will not work) — every variant
a component might need is written out in `uiTokens.ts` and consumed via the
`TONE[tone]` lookup.

To change the accent: edit `ACCENT` and the `brand` entry in `TONE`, done.

## Typography

Inter (`font-sans`, the default) carries body copy. Two fonts layer on top,
loaded via Google Fonts in `index.html` and declared as Tailwind v4 theme
tokens in `index.css` — `--font-condensed` / `--font-mono`, giving literal
`font-condensed` and `font-mono` utility classes:

- **Barlow Condensed** (`font-condensed`, semibold/bold) — the page title
  and the item's headline title, in the left-column rows and the detail
  pane alike. Bold condensed display type for the handful of places a
  reader's eye should land first.
- **JetBrains Mono** (`font-mono`) — dates, the reference-ID and
  published-date fields in Source Classification, and the uppercase
  section micro-labels (`SOURCE CLASSIFICATION`, `EXECUTIVE SUMMARY`,
  `DESIGNATED ENTITIES`). Reference IDs, codes and timestamps read as
  *data*, not prose, so they get the monospace treatment.

This is the type-contrast half of the master-detail layout's hierarchy —
condensed bold headlines against monospace metadata — independent of the
light/neutral/teal colour identity, which is unchanged.

## Layout

- `TopBar` (`components/TopBar.tsx`): a slim, static, full-width title
  strip — logo + "Horizon". There's only one page, so there's nothing to
  navigate between; this replaced the old fixed-width nav sidebar.
- `PageHeader`: the page opens with one — icon, title, plain-language
  subtitle.
- `Panel`: the one card surface (`bg-white ring-1 ring-neutral-200
  shadow-sm rounded-2xl`). Stat tiles, section panels and the detail pane
  are all `Panel` with different padding.
- Master-detail: `ItemList` (a dense, searchable, directly-clickable row
  list) on the left, `ItemDetail` (the full record) on the right. Below the
  `lg` breakpoint the columns stack instead of sitting side by side — see
  "Master-detail responsiveness" in `docs/ARCHITECTURE.md`.

## Components worth knowing

- `ItemDetail`: the full content block for the selected item — header
  (category badge, verified badge, regime, date, next-step chip, title),
  then exactly three sections in order: Source Classification (including
  every source with its PRIMARY/SECONDARY kind badge), Executive Summary
  (confidence dot, Agent-drafted/Human-curated label, "why this matters",
  tags, addedBy), Designated Entities (omitted when an item has none).
  Citation copy sits as a footer action underneath.
- `ItemList`: the left-column surface — search, a newest/oldest toggle, and
  rows that are directly clickable (not expand/collapse) to select an item
  into the detail pane. The selected row gets a highlighted state.
- `CategoryMix` (`components/viz.tsx`): the stacked proportion bar. Anything
  new should compose this rather than adding a chart library.

## Accessibility

- `:focus-visible` gets a visible teal ring as a fallback for anything
  without its own Tailwind focus style.
- List rows carry `role="option"` / `aria-selected` inside an
  `role="listbox"` list, reflecting single-selection rather than
  expand/collapse.
- Colour never carries the only signal — every coloured chip pairs with a
  text label (next-step flags, category badges, source kind).
