# Horizon

An agent-tended sanctions-news tracker for a bank's financial crime team,
covering exactly four regimes: **UK, US, EU, UN**.

Horizon watches a fixed, authoritative list of 24 primary sources — sanctions
lists, licence registers, enforcement pages, legislation, and the political
decisions that tend to precede them — and turns each genuinely new
development into one plain-language item: what happened, the source, which
regime and category it falls under, why it matters for a regulated bank, and
a starting-point next step (never a compliance determination).

## Views

- **Overview** — headline stats, this week's movement, category mix
- **Feed** — every tracked item, filterable by regime
- **UK / US / EU / UN** — one focused view per regime
- **Activity** — a transparency log of what the agent has published

## Status

v0.1. The agent auto-publishes with no human-in-the-loop gate; the one hard
guardrail is that every item must carry a real source URL. See
[`CLAUDE.md`](CLAUDE.md) for the full map of how this is built and
[`agent/README.md`](agent/README.md) for the ingestion contract.

## Running it

```
npm --prefix web install
npm --prefix web run dev
```

Opens on `localhost:5175`.
