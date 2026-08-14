import { Compass, LayoutDashboard, List, Radio, type LucideIcon } from "lucide-react";
import { REGIME_META } from "../content/taxonomy";
import { cn } from "../lib/utils";

export type Page = "overview" | "feed" | "UK" | "US" | "EU" | "UN" | "activity";

// Each tab carries a plain-language descriptor so the tab names aren't cryptic.
const NAV: { id: Page; label: string; desc: string; Icon: LucideIcon }[] = [
  { id: "overview", label: "Overview", desc: "Today's briefing", Icon: LayoutDashboard },
  { id: "feed", label: "Feed", desc: "Everything, filterable", Icon: List },
  { id: "UK", label: REGIME_META.UK.label, desc: REGIME_META.UK.blurb, Icon: REGIME_META.UK.Icon },
  { id: "US", label: REGIME_META.US.label, desc: REGIME_META.US.blurb, Icon: REGIME_META.US.Icon },
  { id: "EU", label: REGIME_META.EU.label, desc: REGIME_META.EU.blurb, Icon: REGIME_META.EU.Icon },
  { id: "UN", label: REGIME_META.UN.label, desc: REGIME_META.UN.blurb, Icon: REGIME_META.UN.Icon },
  { id: "activity", label: "Activity", desc: "What the agent published", Icon: Radio },
];

// Clean, light left sidebar on desktop; a horizontal scrolling bar on mobile.
export function Sidebar({ page, setPage, badgeCount }: { page: Page; setPage: (p: Page) => void; badgeCount: number }) {
  return (
    <aside className="md:w-60 md:shrink-0 md:h-screen md:sticky md:top-0 border-b md:border-b-0 md:border-r border-neutral-200 bg-white z-20">
      <div className="px-4 py-4 flex md:flex-col md:h-full gap-3 md:gap-6 items-center md:items-stretch">
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="grid place-items-center w-9 h-9 rounded-xl bg-teal-50 ring-1 ring-teal-200 text-teal-700">
            <Compass className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div className="hidden md:block">
            <div className="font-medium text-neutral-900 text-sm leading-none tracking-tight">Horizon</div>
            <div className="text-[10px] text-neutral-500 leading-none mt-1 font-light">Sanctions intelligence</div>
          </div>
        </div>

        <nav aria-label="Primary" className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
          {NAV.map(({ id, label, desc, Icon }) => {
            const active = page === id;
            const showCount = id === "activity" && badgeCount > 0;
            return (
              <button
                key={id}
                onClick={() => setPage(id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex items-center gap-2.5 px-2.5 py-2 rounded-xl shrink-0 whitespace-nowrap transition-colors md:border-l-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500/40",
                  active ? "bg-teal-50/60 md:border-teal-600" : "hover:bg-neutral-50 md:border-transparent",
                )}
              >
                <Icon
                  className={cn("h-4 w-4 shrink-0", active ? "text-teal-700" : "text-neutral-400 group-hover:text-neutral-600")}
                  strokeWidth={1.75}
                />
                <span className="md:flex-1 min-w-0">
                  <span
                    className={cn(
                      "block text-left text-[13px] leading-none",
                      active ? "text-neutral-900 font-medium" : "text-neutral-600 font-normal group-hover:text-neutral-900",
                    )}
                  >
                    {label}
                  </span>
                  <span className="hidden md:block text-left text-[10px] leading-none mt-1 font-light text-neutral-500 truncate">{desc}</span>
                </span>
                {showCount && (
                  <span className="grid place-items-center min-w-4 h-4 px-1 rounded-full bg-teal-600 text-white text-[10px] font-semibold tabular-nums">
                    {badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="hidden md:block md:mt-auto pt-4 text-[10px] text-neutral-400 leading-relaxed font-light">
          v0.1 · live
          <br />
          auto-publish, no HITL
        </div>
      </div>
    </aside>
  );
}
