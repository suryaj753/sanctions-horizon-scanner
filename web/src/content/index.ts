import { ITEMS } from "./items";
import feedData from "./feed.json";
import type { Item } from "./types";

// Two sources, one list:
//   ITEMS    — hand-seeded baseline (items.ts)
//   FEED     — agent-published items (feed.json), appended each scheduled
//              run and auto-published (no human gate).
// Keeping the agent's output in plain JSON means it appends safely and
// provenance stays clean. Views consume ALL_ITEMS.
export const FEED = feedData.items as unknown as Item[];
export const FEED_META = { lastUpdated: feedData.lastUpdated };

// De-duplicate the merged list by id. ITEMS come first, so a curated
// (verified) copy wins over an agent duplicate.
function dedupe(items: Item[]): Item[] {
  const seen = new Set<string>();
  return items.filter((i) => {
    if (seen.has(i.id)) return false;
    seen.add(i.id);
    return true;
  });
}

export const ALL_ITEMS: Item[] = dedupe([...ITEMS, ...FEED]);
