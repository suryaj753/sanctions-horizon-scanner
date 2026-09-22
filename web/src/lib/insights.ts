import type { Item } from "../content/types";

// Pure derivations for the dashboards — keep views thin.

export function categoryMix(items: Item[]) {
  const action = items.filter((i) => i.category === "action").length;
  const regulatory = items.filter((i) => i.category === "regulatory-update").length;
  const geopolitical = items.length - action - regulatory;
  return { action, regulatory, geopolitical, total: items.length };
}
