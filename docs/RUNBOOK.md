# Runbook

## Ports

Horizon's dev server runs on **5175** — the Compliance Engine uses 5173 and
Sentinel uses 5174, so all three can run side by side.

## First run

```
npm --prefix web install
npm --prefix web run dev
```

## Everyday commands

| Command | What |
|---|---|
| `npm --prefix web run dev` | dev server on :5175 |
| `npm --prefix web run build` | `tsc -b` + production build |
| `npm --prefix web run preview` | serve the production build |
| `npm --prefix web run lint` | ESLint (flat config, non-type-checked rules) |
| `web/node_modules/.bin/tsc --noEmit` | the type-aware check lint doesn't do |
| `npm --prefix web test` | Vitest (pure-function libs: digest formatting) |
| `npm --prefix web run prose` | plain-language check on hand-authored copy; `--fail` for CI |
| `npm --prefix web run digest` | regenerate `DIGEST.md` from `ALL_ITEMS` |

## Verifying a change

Same discipline as Sentinel: `tsc --noEmit` clean, lint + prose + test
green, preview console clean, and a visual check that the change stays on
the light/neutral/teal identity.

**Headless screenshot gotcha:** headless rasterisation is unreliable on
this machine, so a screenshot tool call may time out even when the app is
fine. Prefer checking the accessibility-tree snapshot or reading the
rendered DOM over relying on a screenshot to confirm a change worked.

## Running an ingest by hand

See [`agent/INGEST.md`](../agent/INGEST.md) for the full spec. In short: an
agent (or you, manually) reads the fixed source list in
[`agent/sources.ts`](../agent/sources.ts), drafts new `Item`s, appends them
to `web/src/content/feed.json`, bumps `lastUpdated`, and runs `npm --prefix
web run digest` to refresh `DIGEST.md`.
