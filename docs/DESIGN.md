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

## Layout

- `Sidebar` (`components/Sidebar.tsx`): fixed-width on desktop, horizontal
  scroll on mobile. Nav order is Overview → Feed → UK → US → EU → UN →
  Activity.
- `PageHeader`: every view opens with one — icon, title, plain-language
  subtitle. The subtitle doubles as the tab's explanation.
- `Panel`: the one card surface (`bg-white ring-1 ring-neutral-200
  shadow-sm rounded-2xl`). Stat tiles, section panels and item cards are all
  `Panel` with different padding.
- Dense tables (`DataTable`) over card grids for item listing — search +
  sortable columns + in-place row expansion, not a separate detail page.

## Components worth knowing

- `ItemDetail`: the shared content block for one item (category badge,
  title, summary, programme, "why this matters", tags, sources, citation
  copy). `header={false}` is used inside an already-labelled table row.
- `CategoryMix` / `MiniBars` (`components/viz.tsx`): the two chart primitives
  — a stacked proportion bar and horizontal distribution bars. Anything new
  should compose these rather than adding a chart library.

## Accessibility

- `:focus-visible` gets a visible teal ring as a fallback for anything
  without its own Tailwind focus style.
- Nav buttons carry `aria-current="page"`; table rows carry
  `aria-expanded`.
- Colour never carries the only signal — every coloured chip pairs with a
  text label (next-step flags, category badges, source kind).
