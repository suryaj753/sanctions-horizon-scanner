import type { Item } from "../content/types";
import { categoryMix } from "../lib/insights";
import { cn } from "../lib/utils";

// A single stacked bar showing the category mix (actions / regulatory /
// geopolitical), with a legend.
export function CategoryMix({ items }: { items: Item[] }) {
  const { action, regulatory, geopolitical, total } = categoryMix(items);
  const pct = (n: number) => (total ? (n / total) * 100 : 0);
  return (
    <div>
      <div className="flex h-2.5 rounded-full overflow-hidden bg-neutral-100">
        {action > 0 && <div className="bg-rose-400" style={{ width: `${pct(action)}%` }} />}
        {regulatory > 0 && <div className="bg-teal-500" style={{ width: `${pct(regulatory)}%` }} />}
        {geopolitical > 0 && <div className="bg-amber-400" style={{ width: `${pct(geopolitical)}%` }} />}
      </div>
      <div className="mt-2 flex items-center gap-3 text-[11px] text-neutral-500">
        <Legend dot="bg-rose-400" label="Actions" n={action} />
        <Legend dot="bg-teal-500" label="Regulatory" n={regulatory} />
        <Legend dot="bg-amber-400" label="Geopolitical" n={geopolitical} />
      </div>
    </div>
  );
}

function Legend({ dot, label, n }: { dot: string; label: string; n?: number }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("w-2 h-2 rounded-full", dot)} />
      {label} {n !== undefined && <span className="tabular-nums text-neutral-400">{n}</span>}
    </span>
  );
}
