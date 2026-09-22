# Content model

## The `Item` schema

Defined in `web/src/content/types.ts`. Every tracked development — a
designation, a licence change, a statutory instrument, a Security Council
resolution — is the same shape:

| Field | Meaning |
|---|---|
| `regime` | `UK \| US \| EU \| UN` — which of the four tracked regimes |
| `category` | `action \| regulatory-update \| geopolitical` (see below) |
| `title`, `summary` | plain-language headline + synthesis |
| `whyItMatters` | the bank financial-crime lens — potential organisational impact |
| `nextStep` | `review-screening-lists \| monitor-only \| assess-framework-impact` — a starting point, never a compliance determination |
| `programme` | the jurisdiction(s) / sanctions programme(s), free text (e.g. "Russia — cyber-related") |
| `date` / `addedAt` | event date vs. when Horizon ingested it |
| `addedBy` | `agent \| human` |
| `status` | `published \| pending \| rejected` |
| `confidence` | the agent's honest certainty in the item, distinct from `nextStep` |
| `verified` | a human vouch — **never** set by the agent |
| `entities` | named individuals/entities the item is specifically about, when known from the source — optional, omit rather than guess |
| `tags` | freeform, used for search and cross-linking |
| `sources` | `{ name, url?, kind? }[]` — at least one with a URL, hard requirement for publish |

## Category taxonomy

Three categories, matching the original brief exactly (not a Sentinel-style
open-ended `ItemType`):

- **`action`** — new designations, delistings, licences granted/amended/
  revoked, enforcement actions and penalties.
- **`regulatory-update`** — changes to guidance, frameworks, reporting
  obligations, compliance expectations, statutory-instrument changes.
- **`geopolitical`** — Security Council resolutions, presidential actions/
  Executive Orders, CJEU judgments, and political decisions (e.g. a new
  sanctions package) likely to trigger future sanctions activity.

Finer distinctions (which kind of action, which programme) live in `tags`
and `programme`, not as new structured fields — keep the schema as flat as
the brief specifies.

## Integrity rules

- Every published item has ≥1 source with a URL. No source, no publish.
- Never invent a designation, delisting, penalty amount or date. If a
  detail can't be confirmed from the source, omit it or label the item
  `confidence: "low"` and say why in the summary.
- Paywalled or restricted content is summarised and linked, never
  republished.
- `verified: true` is a human-only action — it means someone on the team
  has read the primary source and vouches for the item. The agent never
  sets it.
- `entities` only gets populated with names actually read from the source.
  If the source only gives a count ("13 designations") without naming them,
  leave `entities` unset rather than list placeholder or partial names — an
  incomplete-looking list reads as complete to someone skimming it.

## Status lifecycle

The agent auto-publishes (`status: "published"` on write, no gate). `pending`
and `rejected` exist in the schema for a human curator who wants to draft
something for review before it goes live, or note that a drafted item was
rejected — the agent itself never uses either.

## Seeding

`items.ts` starts as an **empty array**, deliberately. Unlike an
illustrative demo, this tool never ships placeholder sanctions data — a
fabricated designation sitting in seed data would be indistinguishable from
a real one to a reader skimming the Feed. Real content arrives only through
a genuine ingestion run (`agent/INGEST.md`) or a human adding a
source-backed item to `items.ts` by hand.
