# Ingestion run spec

This is the exact, repeatable job the scheduled agent runs each cycle. It is
written as instructions an agent can follow directly.

## Goal

Find genuinely new developments across the UK, US, EU and UN sanctions
regimes since the last run, draft them as `Item`s, and **auto-publish** them
by appending to `web/src/content/feed.json`.

## Inputs

- [`sources.ts`](sources.ts), the fixed 24-source registry. This is
  **exhaustive and authoritative by design** — scan exactly these sources,
  do not go discover new ones on the open web. If a source's URL has moved
  or its content model changed since the `notes` field was written,
  re-verify it (fetch it, don't guess) before relying on it, and update the
  `notes` field.
- `web/src/content/items.ts` + `web/src/content/feed.json`: existing items;
  use their `id`s to **dedupe** (don't re-publish the same development).

## Fetching pages

Read pages with the local **Trafilatura** CLI where possible — it returns
the page's actual text as markdown (plus title/URL metadata), so titles,
exact dates and reference numbers come from the source itself instead of an
AI-digested summary. This is the fidelity backbone of the no-fabrication
guardrail:

```
trafilatura --output-format markdown --with-metadata -u "URL"
```

(Adjust to the local install path if `trafilatura` isn't on `PATH`.)

- **Bot-checked domains**: `main.un.org`, `eur-lex.europa.eu` and
  `consilium.europa.eu` return a bot-check page to a plain automated fetch.
  For these three, use the browser pane or WebFetch instead of a bare
  Trafilatura call.
- **Client-rendered pages**: OFAC's General Licences page
  (`ofac.treasury.gov/recent-actions/general-licenses`) is client-rendered;
  a plain fetch returns an empty shell. Use the browser pane for it.
- **Login-gated search**: the EU Financial Sanctions Database's interactive
  search now requires an EU Login account. Use the static file download
  (linked from the FSD page) instead of the search UI.
- Long pages: redirect to a scratch file and read that instead of dumping
  stdout.
- The metadata `date:` is the page's first-published date; take event dates
  from the page **body**, not that field, when the two differ.

## Steps

1. **Scan** every source in [`sources.ts`](sources.ts) for items dated since
   the last `lastUpdated`, using each source's `focus` field to know what to
   extract.
2. **Dedupe** against existing ids; skip anything already covered.
3. **Classify** each new development into exactly one category:
   - **`action`** — new designations, delistings, licences granted/amended/
     revoked, enforcement actions or penalties.
   - **`regulatory-update`** — changes to guidance, frameworks, reporting
     obligations, compliance expectations, legislative/statutory-instrument
     changes.
   - **`geopolitical`** — Security Council resolutions, presidential
     actions/Executive Orders, CJEU judgments, and political decisions
     (e.g. a new sanctions package) likely to trigger future sanctions
     activity.
4. **Draft** each new item as an [`Item`](../web/src/content/types.ts):
   - `regime` (UK/US/EU/UN), `category`, `title`, `summary` in plain
     language;
   - **`whyItMatters`**: potential organisational impact for a regulated
     bank — exposure to newly designated entities/sectors, screening-list
     updates needed, framework/policy implications;
   - **`nextStep`**: `review-screening-lists` / `monitor-only` /
     `assess-framework-impact` — a starting point for the reader, phrase it
     as a suggestion, never as a compliance determination;
   - `date` (event), `addedAt` (today), `addedBy: "agent"`,
     `status: "published"`;
   - `programme`: the relevant jurisdiction(s)/sanctions programme(s), e.g.
     "Russia — cyber-related";
   - `tags` and **`sources`** with at least one URL;
   - `confidence` (`high`/`medium`/`low`): your honest certainty in the
     item — say so in the `summary` too if it's not high;
   - mark each source's `kind`: `primary` (the official/originating
     document) or `secondary` (reporting/analysis about it);
   - **never set `verified`**: that flag is a human vouch only. The agent
     publishes unverified; a human marks `verified: true` when they vouch.
5. **Validate** (hard gates, drop the item if it fails):
   - has ≥1 source URL; no fabricated specifics (no invented designation,
     delisting, penalty amount or date); if a detail can't be confirmed,
     omit it or mark the item `confidence: "low"` and say why.
6. **Write**: append the new items to `feed.json` and set `lastUpdated` to
   today.
7. **Digest**: regenerate the rolling weekly one-pager,
   `npm --prefix web run digest` (writes `DIGEST.md` at the repo root).
   Cheap and idempotent, run it every cycle so the digest stays current.
8. (Remote mode) commit the diff (include `DIGEST.md`):
   `feat(feed): ingest YYYY-MM-DD (N items)`.

## Output shape (`feed.json`)

```json
{ "lastUpdated": "YYYY-MM-DD", "items": [ /* Item objects */ ] }
```

## Cadence

Daily or weekly. Keep runs small and well-sourced; a steady trickle of
sharp, cited items beats a flood. If a run finds nothing new, do nothing
(don't pad).
