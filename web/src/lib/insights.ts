import type { Item } from "../content/types";

// Pure derivations for the dashboards — keep views thin.

export function countBy(items: Item[], key: (i: Item) => string | undefined): { label: string; n: number }[] {
  const m = new Map<string, number>();
  for (const i of items) {
    const k = key(i);
    if (k) m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()].map(([label, n]) => ({ label, n })).sort((a, b) => b.n - a.n);
}

export function categoryMix(items: Item[]) {
  const action = items.filter((i) => i.category === "action").length;
  const regulatory = items.filter((i) => i.category === "regulatory-update").length;
  const geopolitical = items.length - action - regulatory;
  return { action, regulatory, geopolitical, total: items.length };
}
