import { useState } from "react";
import { ChevronLeft, List, ShieldAlert, Gavel } from "lucide-react";
import type { Item, Regime } from "../content/types";
import { REGIME_META, CATEGORY_META } from "../content/taxonomy";
import { PageHeader } from "../components/PageHeader";
import { ItemList } from "../components/ItemList";
import { ItemDetail } from "../components/ItemDetail";
import { Panel, Stat, SectionHeading, EmptyState } from "../lib/ui";
import { CategoryMix } from "../components/viz";
import { cn } from "../lib/utils";

const REGIMES: Regime[] = ["UK", "US", "EU", "UN"];

// The only page in the app: stat cards + category mix, then a master-detail
// split — a filterable list of every tracked item on the left, the full
// detail of whichever one is selected on the right.
export function HorizonScanning({ items }: { items: Item[] }) {
  const all = items.filter((i) => i.status === "published").sort((a, b) => (a.date < b.date ? 1 : -1));
  const [regimeFilter, setRegimeFilter] = useState<Regime | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileShowDetail, setMobileShowDetail] = useState(false);

  const shown = regimeFilter === "all" ? all : all.filter((i) => i.regime === regimeFilter);
  // Default to the most recent item in view until the reader picks one
  // explicitly, so the detail pane is never empty on first load.
  const selected = all.find((i) => i.id === selectedId) ?? shown[0] ?? null;

  const handleSelect = (id: string, opts?: { userInitiated?: boolean }) => {
    setSelectedId(id);
    if (opts?.userInitiated) setMobileShowDetail(true);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        Icon={List}
        title="Horizon Scanning"
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

      <div className="lg:grid lg:grid-cols-[380px_1fr] lg:items-start gap-4">
        <div className={cn("min-w-0 space-y-3", mobileShowDetail ? "hidden lg:block" : "block")}>
          <div className="flex items-center flex-wrap gap-1.5">
            <button
              onClick={() => setRegimeFilter("all")}
              className={cn(
                "rounded-md px-2.5 py-1 text-[11px] font-medium ring-1 transition-colors",
                regimeFilter === "all" ? "bg-teal-50 text-teal-700 ring-teal-200" : "bg-white text-neutral-500 ring-neutral-200 hover:text-neutral-800 hover:bg-neutral-50",
              )}
            >
              All regimes
            </button>
            {REGIMES.map((r) => (
              <button
                key={r}
                onClick={() => setRegimeFilter(r)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-[11px] font-medium ring-1 transition-colors",
                  regimeFilter === r ? "bg-teal-50 text-teal-700 ring-teal-200" : "bg-white text-neutral-500 ring-neutral-200 hover:text-neutral-800 hover:bg-neutral-50",
                )}
              >
                {REGIME_META[r].label}
              </button>
            ))}
          </div>

          {shown.length > 0 ? (
            <ItemList items={shown} selectedId={selectedId} onSelect={handleSelect} />
          ) : (
            <p className="text-sm text-neutral-400">No items in this view yet.</p>
          )}

          <p className="text-[11px] text-neutral-400">{Object.values(CATEGORY_META).map((c) => c.label).join(" · ")}</p>
        </div>

        <div className={cn("min-w-0", mobileShowDetail ? "block" : "hidden lg:block")}>
          {mobileShowDetail && (
            <button
              onClick={() => setMobileShowDetail(false)}
              className="lg:hidden mb-3 inline-flex items-center gap-1 text-[12px] font-medium text-neutral-600 hover:text-teal-700"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Back to list
            </button>
          )}
          {selected ? (
            <Panel className="p-4 lg:sticky lg:top-20">
              <ItemDetail item={selected} />
            </Panel>
          ) : all.length === 0 ? (
            <EmptyState Icon={List} title="No items tracked yet" body="Real content arrives once the ingestion agent publishes, or a human curator adds a source-backed item." />
          ) : (
            <EmptyState Icon={ShieldAlert} title="No matches" body="Try a different search term or regime filter." />
          )}
        </div>
      </div>
    </div>
  );
}
