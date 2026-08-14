import { useState } from "react";
import { ChevronDown, MapPin, Search, ArrowUp, ArrowDown, ShieldCheck } from "lucide-react";
import type { Item } from "../content/types";
import { CATEGORY_META, NEXT_STEP_META } from "../content/taxonomy";
import { Panel } from "../lib/ui";
import { ItemDetail } from "./ItemDetail";
import { relativeDay, cn } from "../lib/utils";

// Dense table with search + sortable columns. Each row expands in place to
// reveal the full summary, "why this matters", and sources.
export function DataTable({ items }: { items: Item[] }) {
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" }>({ key: "Date", dir: "desc" });

  const toggle = (id: string) =>
    setOpen((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const valueFor = (i: Item, key: string): string | number => {
    if (key === "Name") return i.title.toLowerCase();
    if (key === "Regime") return i.regime;
    if (key === "Category") return CATEGORY_META[i.category].label;
    if (key === "Date") return i.date;
    return "";
  };
  const toggleSort = (key: string) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: key === "Name" ? "asc" : "desc" }));

  const q = query.trim().toLowerCase();
  const filtered = q
    ? items.filter(
        (i) => i.title.toLowerCase().includes(q) || i.summary.toLowerCase().includes(q) || i.tags.some((t) => t.toLowerCase().includes(q)),
      )
    : items;
  const rows = [...filtered].sort((a, b) => {
    const va = valueFor(a, sort.key);
    const vb = valueFor(b, sort.key);
    const c = va < vb ? -1 : va > vb ? 1 : 0;
    return sort.dir === "asc" ? c : -c;
  });

  const cols: { label: string; width: string }[] = [
    { label: "Regime", width: "w-16" },
    { label: "Category", width: "w-40" },
    { label: "Date", width: "w-16" },
  ];

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
        <span className="text-[10px] text-neutral-400 tabular-nums shrink-0">
          {rows.length}/{items.length}
        </span>
      </div>

      <div className="flex items-center gap-3 px-4 py-2 text-[10px] uppercase tracking-wide text-neutral-400 border-b border-neutral-200">
        <span className="w-4 shrink-0" aria-hidden />
        <button onClick={() => toggleSort("Name")} className="flex-1 flex items-center gap-1 text-left hover:text-neutral-600 transition-colors">
          Name <SortArrow active={sort.key === "Name"} dir={sort.dir} />
        </button>
        {cols.map((c) => (
          <button
            key={c.label}
            onClick={() => toggleSort(c.label)}
            className={cn(c.width, "hidden sm:flex items-center justify-end gap-1 hover:text-neutral-600 transition-colors")}
          >
            {c.label} <SortArrow active={sort.key === c.label} dir={sort.dir} />
          </button>
        ))}
        <span className="w-4 shrink-0" aria-hidden />
      </div>

      {rows.length === 0 ? (
        <div className="px-4 py-6 text-center text-xs text-neutral-400">No matches.</div>
      ) : (
        rows.map((item) => {
          const isOpen = open.has(item.id);
          const Icon = CATEGORY_META[item.category].Icon;
          return (
            <div key={item.id} className="border-b border-neutral-100 last:border-0">
              <button
                onClick={() => toggle(item.id)}
                aria-expanded={isOpen}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-neutral-50 transition-colors"
              >
                <Icon className="h-4 w-4 text-neutral-400 shrink-0" strokeWidth={2} />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] text-neutral-900 truncate flex items-center gap-1.5">
                    {item.verified && <ShieldCheck className="h-3 w-3 text-teal-700 shrink-0" aria-label="Verified" />}
                    <span className="truncate">{item.title}</span>
                  </div>
                  <div className="text-[10px] text-neutral-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-2.5 w-2.5" />
                    {item.regime}
                    <span className="text-neutral-300">·</span>
                    <span className="sm:hidden tabular-nums">{relativeDay(item.date)}</span>
                    <span className="hidden sm:inline text-neutral-400 truncate">{shortTeaser(item)}</span>
                  </div>
                </div>
                <span className="w-16 text-right text-[11px] hidden sm:block shrink-0 text-neutral-500">{item.regime}</span>
                <span className="w-40 text-right text-[11px] hidden sm:block shrink-0">
                  {item.nextStep ? (
                    <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", NEXT_STEP_META[item.nextStep].chip)}>
                      {NEXT_STEP_META[item.nextStep].label}
                    </span>
                  ) : (
                    <span className="text-neutral-400">{CATEGORY_META[item.category].label}</span>
                  )}
                </span>
                <span className="w-16 text-right text-[11px] hidden sm:block shrink-0 text-neutral-500 tabular-nums">{relativeDay(item.date)}</span>
                <ChevronDown className={cn("h-4 w-4 text-neutral-400 shrink-0 transition-transform", isOpen && "rotate-180")} />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pt-1 bg-neutral-50/60">
                  <div className="sm:pl-7">
                    <ItemDetail item={item} header={false} onTagClick={setQuery} />
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </Panel>
  );
}

function shortTeaser(i: Item) {
  const s = i.summary.split(/[.;:]/)[0];
  return s.length > 90 ? s.slice(0, 90) + "…" : s;
}

function SortArrow({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) return null;
  return dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
}
