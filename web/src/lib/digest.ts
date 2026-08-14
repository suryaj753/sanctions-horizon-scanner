import type { Item, Regime } from "../content/types";
import { REGIME_META, CATEGORY_META } from "../content/taxonomy";
import { longDate } from "./utils";

// A weekly "what moved" one-pager, derived from the last 7 days of ingestion
// (by `addedAt`). Pure markdown — used by the in-app "Weekly digest" export
// and by the agent's `npm run digest` (scripts/digest.ts).

const REGIME_ORDER: Regime[] = ["UK", "US", "EU", "UN"];

function byNotable(a: Item, b: Item): number {
  if (!!a.verified !== !!b.verified) return a.verified ? -1 : 1;
  return a.addedAt < b.addedAt ? 1 : -1;
}

export function weeklyDigest(items: Item[], now = new Date()): string {
  const weekAgo = now.getTime() - 7 * 86_400_000;
  const pub = items.filter((i) => i.status === "published");
  const fresh = pub.filter((i) => new Date(i.addedAt + "T00:00:00").getTime() >= weekAgo);

  const lines: string[] = [
    `# Horizon weekly digest: ${longDate(now.toISOString().slice(0, 10))}`,
    "",
    `_${fresh.length} new item${fresh.length === 1 ? "" : "s"} in the last 7 days · Horizon · sanctions intelligence_`,
  ];

  if (fresh.length === 0) {
    lines.push("", "_No new items surfaced this week._");
    return lines.join("\n");
  }

  lines.push("", "## What moved");
  for (const regime of REGIME_ORDER) {
    const inRegime = fresh.filter((i) => i.regime === regime);
    if (inRegime.length === 0) continue;
    const top = [...inRegime].sort(byNotable)[0];
    lines.push(`- **${REGIME_META[regime].label}**: ${inRegime.length} new item${inRegime.length === 1 ? "" : "s"}; latest: ${top.title}`);
  }

  const notable = [...fresh].sort(byNotable).slice(0, 6);
  lines.push("", "## Notable this week");
  for (const i of notable) {
    const flags = [i.verified ? "✓ Verified" : null, CATEGORY_META[i.category].label].filter(Boolean).join(" · ");
    const meta = [REGIME_META[i.regime].label, i.programme, longDate(i.date), flags].filter(Boolean).join(" · ");
    lines.push("", `### ${i.title}`, `*${meta}*`);
    if (i.whyItMatters) lines.push(`> **Why this matters:** ${i.whyItMatters}`);
    const src = i.sources.find((s) => s.kind === "primary") ?? i.sources[0];
    if (src) lines.push(`Source: ${src.url ? `[${src.name}](${src.url})` : src.name}`);
  }

  const actions = fresh.filter((i) => i.category === "action").length;
  const verified = fresh.filter((i) => i.verified).length;
  lines.push("", "## By the numbers", `${fresh.length} new · ${actions} sanctions actions · ${verified} verified`);

  return lines.join("\n");
}
