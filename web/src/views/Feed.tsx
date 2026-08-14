import { useState } from "react";
import { List, ShieldAlert, Gavel } from "lucide-react";
import type { Item, Regime } from "../content/types";
import { REGIME_META, CATEGORY_META } from "../content/taxonomy";
import { PageHeader } from "../components/PageHeader";
import { DataTable } from "../components/DataTable";
import { Panel, Stat, SectionHeading } from "../lib/ui";
import { CategoryMix } from "../components/viz";
import { cn } from "../lib/utils";

const REGIMES: Regime[] = ["UK", "US", "EU", "UN"];

// The combined feed: every published item across all four regimes, filterable
// by regime. Signals/regulatory/typology all folded into the one shape here.
export function Feed({ items }: { items: Item[] }) {
  const all = items.filter((i) => i.status === "published").sort((a, b) => (a.date < b.date ? 1 : -1));
  const [regime, setRegime] = useState<Regime | "all">("all");
  const shown = regime === "all" ? all : all.filter((i) => i.regime === regime);

  return (
    <div className="space-y-4">
      <PageHeader
        Icon={List}
        title="Feed"
        subtitle="Every tracked development across UK, US, EU and UN sanctions regimes, newest first."
        right={
          <span className="text-xs text-neutral-500 tabular-nums">
            {shown.length} item{shown.length === 1 ? "" : "s"}
          </span>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat Icon={List} tone="brand" label="Tracked" value={all.length} />
        <Stat Icon={Gavel} tone="rose" label="Sanctions actions" value={all.filter((i) => i.category === "action").length} />
        <Stat
          Icon={ShieldAlert}
          tone="amber"
          label="Review screening"
          value={all.filter((i) => i.nextStep === "review-screening-lists").length}
        />
        <Stat Icon={List} tone="neutral" label="Regimes covered" value={new Set(all.map((i) => i.regime)).size} />
      </div>

      <Panel className="p-4">
        <SectionHeading Icon={ShieldAlert} title="Category mix" />
        <CategoryMix items={all} />
      </Panel>

      <div className="flex items-center flex-wrap gap-1.5">
        <button
          onClick={() => setRegime("all")}
          className={cn(
            "rounded-md px-2.5 py-1 text-[11px] font-medium ring-1 transition-colors",
            regime === "all" ? "bg-teal-50 text-teal-700 ring-teal-200" : "bg-white text-neutral-500 ring-neutral-200 hover:text-neutral-800 hover:bg-neutral-50",
          )}
        >
          All regimes
        </button>
        {REGIMES.map((r) => (
          <button
            key={r}
            onClick={() => setRegime(r)}
            className={cn(
              "rounded-md px-2.5 py-1 text-[11px] font-medium ring-1 transition-colors",
              regime === r ? "bg-teal-50 text-teal-700 ring-teal-200" : "bg-white text-neutral-500 ring-neutral-200 hover:text-neutral-800 hover:bg-neutral-50",
            )}
          >
            {REGIME_META[r].label}
          </button>
        ))}
      </div>

      {shown.length > 0 ? <DataTable items={shown} /> : <p className="text-sm text-neutral-400">No items in this view yet.</p>}

      <p className="text-[11px] text-neutral-400">
        {Object.values(CATEGORY_META).map((c) => c.label).join(" · ")}
      </p>
    </div>
  );
}
