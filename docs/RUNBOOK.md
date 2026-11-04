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

## Sources that block plain automated fetches

As of the 4 November 2026 runs (see `coverage` in `feed.json` for the
latest state):

| Source | What happens | Options for an unattended run |
|---|---|---|
| Council of the EU (`consilium.europa.eu`) | 403 "Checking your browser" challenge, plain HTTP and headless browser alike | Official journal (EUR-Lex OJ L series) for adopted acts; a fetch service that handles bot checks; or human-checked |
| UN list-update log, consolidated list, committees, resolutions (`main.un.org`) | 202 bot challenge to plain HTTP; loads in a plain headless browser | Headless browser; the official consolidated list XML download; resolution PDFs on `documents.un.org` fetch directly |
| UN press releases (`press.un.org`) | CAPTCHA, even in a headless browser | Human-checked; names can sometimes be read from the consolidated list XML once entries are amended (not for delistings) |
| EU Financial Sanctions Database | Search UI and static files route both redirect to EU Login | An EU Login service account for the official file download, or human-checked |
| CJEU (`curia.europa.eu`, InfoCuria) | 403 "site temporarily unavailable" | Retry later; a fetch service; or human-checked |
| OFAC General Licences and Recent Actions index | Client-rendered list; empty to plain HTTP | Headless browser for the index; per-day pages fetch directly but miss suffixed same-day actions (`_33`); OFAC's SLS data files for list changes |

For a move to the Claude API: prefer official downloadable files wherever
they exist, put a browser-capable fetch step in front of the model for the
client-rendered pages, and keep anything behind a challenge, CAPTCHA or
login as human-checked, recorded `unreachable` in coverage. Do not spoof
user agents or hide automation to get past a challenge.

