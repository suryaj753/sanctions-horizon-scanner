import type { Item } from "./types";

// Hand-seeded baseline. Deliberately empty at launch: this tool never
// fabricates a sanctions designation, licence or enforcement action, so
// there is no illustrative content standing in for real data. The first
// ingestion run (see agent/INGEST.md) populates web/src/content/feed.json
// with real, sourced items; a human can additionally curate items here.
export const ITEMS: Item[] = [];
