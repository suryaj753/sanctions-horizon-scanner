# CLAUDE.md: entry point for Horizon

**Small, stable, and made of pointers.** This is the table of contents new
sessions read first; detail lives in `docs/`. This file changes rarely, only
when a project-wide rule changes.

---

## What this is

**Horizon**: an agent-tended sanctions-news tracker for a bank's financial
crime team, scoped to exactly four regimes: **UK, US, EU, UN**. It shares its
architecture (scan → dedupe → draft → validate → publish, one content model,
the dark-vs-light-sibling design discipline) with Sentinel
(`../sentinel-da-fincrime-intel`), a separate, standalone tool. Horizon is
**not** a digital-assets tool: its source registry, taxonomy and audience are
general bank sanctions compliance, with no crypto angle. React 19 + Vite +
Tailwind v4. Dev server on `localhost:5175` (the Compliance Engine runs on
5173, Sentinel on 5174).

## The thesis (drives every decision)

**A fixed, authoritative source list, not an open-web news feed.** The 24
sources in `agent/sources.ts` are exhaustive by design (UK/US/EU/UN,
Step 2 of the original brief); the agent does not discover new sources on
its own. Every item carries a **"Why this matters"** for a regulated bank
and a **next-step flag** (Review screening lists / Monitor only / Assess
framework impact) that is explicitly a starting point, never a compliance
determination. The agent does the monitoring and first-draft synthesis;
human judgement is what makes it credible.

---

## Three rules every change honours

### 1. One content model, one view family: non-negotiable

Every tracked thing is one `Item` (`web/src/content/types.ts`) with
`regime` (UK/US/EU/UN) and `category` (action / regulatory-update /
geopolitical) discriminators. Each tab — the four regime views, the
combined Feed, Activity — is a **filtered view** over the single store
(`web/src/content/items.ts` + `feed.json`, merged in `content/index.ts`).
The ingestion agent only ever emits `Item`s. Reuse `DataTable`, `ItemDetail`,
`Panel`, the tokens; don't add bespoke surfaces.

### 2. Design identity: clean, neutral, light

Deliberately distinct from **both** sibling apps: the Compliance Engine
(light + blue) and Sentinel (dark + violet). White/neutral-50 base, a single
muted **teal** accent, amber/rose used sparingly for the next-step flag
only. This is an operational reading tool for a compliance team, not a
dashboard competing for attention. All colour is enumerated in
`lib/uiTokens.ts` (Tailwind v4 only sees literal class strings, never build
colour by interpolation).

### 3. Content integrity: harder here than in a general news tool

Cite a source for every factual claim. **Never** fabricate a designation,
delisting, licence action or penalty. The agent **auto-publishes** (no
human gate), so the guardrail is hard: **every auto-published item must
carry a real source URL**, no source, no publish. A wrong sanctions fact is
not a cosmetic error for a bank's compliance team, so when in doubt the
agent sets `confidence: "low"` and says so in the summary rather than
smoothing over uncertainty. The Activity view is a transparency log.

---

## Where to look: the map

| Working on… | Read |
|---|---|
| Architecture, the one-model design, file map, state, adding a regime | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) |
| Design system: light/teal tokens, layout, components, a11y | [`docs/DESIGN.md`](docs/DESIGN.md) |
| The `Item` schema, taxonomy, integrity rules, seeding & status lifecycle | [`docs/CONTENT.md`](docs/CONTENT.md) |
| Running it: ports, typecheck, the preview/headless gotcha | [`docs/RUNBOOK.md`](docs/RUNBOOK.md) |
| Ingestion agent: auto-publish contract + the ingest run spec | [`agent/README.md`](agent/README.md) · [`agent/INGEST.md`](agent/INGEST.md) |
| Public, user-facing overview | [`README.md`](README.md) |

---

## Verification discipline (every change)

1. `tsc --noEmit` clean (run via `web/node_modules/.bin/tsc`).
2. `npm --prefix web run lint` + `npm --prefix web run prose` + `npm --prefix
   web test` green. `feed.json` is the agent's file and is not prose-gated,
   so a daily ingest cannot fail CI on a quoted external title.
3. Preview console clean (no errors/warnings).
4. Decluttered + on-identity (light/neutral/teal): confirm before reporting.

---

## Doc-gardening: keep this map fresh

- When a module changes, **update the relevant `docs/<TOPIC>.md` in the same
  change**. CLAUDE.md itself changes rarely, only for a project-wide rule.
- A fact lives in exactly one place; everywhere else links to it.
