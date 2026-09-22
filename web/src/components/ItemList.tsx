import { useEffect, useState } from "react";
import { Search, ArrowUpDown, ShieldCheck } from "lucide-react";
import type { Item } from "../content/types";
import { CATEGORY_META } from "../content/taxonomy";
import { Panel } from "../lib/ui";
import { relativeDay, cn } from "../lib/utils";

// The left column of the master-detail layout: search + a newest/oldest
// toggle, then every row directly clickable to select it into the detail
// pane on the right (no expand/collapse — that's the whole point of the
// master-detail split).
export function ItemList({
  items,
  selectedId,
  onSelect,
}: {
  items: Item[];
  selectedId: string | null;
  /** `userInitiated` distinguishes an explicit row click (which should also
   * reveal the detail pane on mobile) from the list's own auto-select of
   * the top row when the selection falls out of view. */
  onSelect: (id: string, opts?: { userInitiated?: boolean }) => void;
}) {
  const [query, setQuery] = useState("");
  const [dir, setDir] = useState<"asc" | "desc">("desc");

  const q = query.trim().toLowerCase();
  const filtered = q
    ? items.filter(
        (i) => i.title.toLowerCase().includes(q) || i.summary.toLowerCase().includes(q) || i.tags.some((t) => t.toLowerCase().includes(q)),
      )
    : items;
  const rows = [...filtered].sort((a, b) => {
    const c = a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
    return dir === "asc" ? c : -c;
  });

  // Keep a selection live: default to the most recent row, and re-anchor if
  // the current selection filters out of view.
  useEffect(() => {
    if (rows.length > 0 && !rows.some((r) => r.id === selectedId)) {
      onSelect(rows[0].id);
    }
  }, [rows, selectedId, onSelect]);

  return (
    <Panel className="overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-neutral-200">
        <Search className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title, summary, tags…"
          className="flex-1 bg-transparent text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none"
        />
        <button
          onClick={() => setDir((d) => (d === "desc" ? "asc" : "desc"))}
          className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-neutral-400 hover:text-neutral-600 transition-colors shrink-0"
        >
          <ArrowUpDown className="h-3 w-3" /> {dir === "desc" ? "Newest" : "Oldest"}
        </button>
        <span className="text-[10px] text-neutral-400 tabular-nums shrink-0">
          {rows.length}/{items.length}
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="px-4 py-6 text-center text-xs text-neutral-400">No matches.</div>
      ) : (
        <div role="listbox" aria-label="Tracked items" className="max-h-[70vh] overflow-y-auto">
          {rows.map((item) => {
            const isSelected = item.id === selectedId;
            const Icon = CATEGORY_META[item.category].Icon;
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id, { userInitiated: true })}
                role="option"
                aria-selected={isSelected}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 text-left border-l-2 border-b border-neutral-100 last:border-b-0 transition-colors",
                  isSelected ? "bg-teal-50/60 border-l-teal-600" : "border-l-transparent hover:bg-neutral-50",
                )}
              >
                <Icon className="h-4 w-4 text-neutral-400 shrink-0" strokeWidth={2} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mb-0.5">
                    <span className="font-medium text-neutral-500 truncate max-w-[55%]">{item.sources[0]?.name ?? item.regime}</span>
                    <span className="text-neutral-300 shrink-0">·</span>
                    <span className="shrink-0">{item.regime}</span>
                  </div>
                  <div className="text-[13px] font-condensed font-semibold text-neutral-900 truncate flex items-center gap-1.5">
                    {item.verified && <ShieldCheck className="h-3 w-3 text-teal-700 shrink-0" aria-label="Verified" />}
                    <span className="truncate">{item.title}</span>
                  </div>
                  <div className="text-[10px] text-neutral-500 flex items-center gap-1 mt-0.5">
                    <span className="font-mono tabular-nums shrink-0">{relativeDay(item.date)}</span>
                    <span className="text-neutral-300 shrink-0">·</span>
                    <span className="text-neutral-400 truncate">{shortTeaser(item)}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </Panel>
  );
}

function shortTeaser(i: Item) {
  const s = i.summary.split(/[.;:]/)[0];
  return s.length > 90 ? s.slice(0, 90) + "…" : s;
}
