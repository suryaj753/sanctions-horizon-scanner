import { Bot, ShieldAlert, Layers, Sparkles, ArrowRight, List, LayoutDashboard, Flame, Download, Gavel } from "lucide-react";
import type { Item, Regime } from "../content/types";
import type { Page } from "../components/Sidebar";
import { REGIME_META } from "../content/taxonomy";
import { Panel, Stat, SectionHeading } from "../lib/ui";
import { ItemCard } from "../components/ItemCard";
import { CopyButton } from "../components/CopyButton";
import { PageHeader } from "../components/PageHeader";
import { CategoryMix, MiniBars } from "../components/viz";
import { countBy } from "../lib/insights";
import { weeklyDigest } from "../lib/digest";
import { downloadText } from "../lib/export";
import { withinDays } from "../lib/utils";

const REGIMES: Regime[] = ["UK", "US", "EU", "UN"];

// The command centre: headline metrics, a per-regime summary, the category
// mix, and the latest few items.
export function Overview({ items, setPage, lastUpdated }: { items: Item[]; setPage: (p: Page) => void; lastUpdated: string }) {
  const published = items.filter((i) => i.status === "published");
  const agentSourced = published.filter((i) => i.addedBy === "agent");
  const actions = published.filter((i) => i.category === "action");
  const thisWeek = published.filter((i) => withinDays(i.addedAt, 7));
  const latest = [...published].sort(byIngestedDesc).slice(0, 3);
  const byRegime = countBy(published, (i) => i.regime);

  const todayLabel = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const digest = weeklyDigest(published);
  const downloadDigest = () => downloadText(`horizon-weekly-digest-${new Date().toISOString().slice(0, 10)}.md`, digest, "text/markdown");

  return (
    <div className="space-y-5">
      <PageHeader
        Icon={LayoutDashboard}
        eyebrow={todayLabel}
        title="Overview"
        subtitle="A single, agent-tended pane of glass on UK, US, EU and UN sanctions activity: what changed, and what it means for the bank."
      />

      <Panel className="p-3 flex items-center gap-3">
        <span className="relative grid place-items-center w-8 h-8 rounded-lg bg-teal-50 ring-1 ring-teal-200 text-teal-700 shrink-0">
          <Bot className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-teal-600 ring-2 ring-white" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-neutral-800">The intelligence agent is publishing automatically</div>
          <div className="text-xs text-neutral-500">
            Last updated <span className="text-neutral-700 tabular-nums">{lastUpdated}</span> · auto-publish, no human-in-the-loop
          </div>
        </div>
        <button
          onClick={() => setPage("activity")}
          className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 text-neutral-700 ring-1 ring-neutral-200 text-xs font-medium px-3.5 py-1.5 hover:bg-neutral-200 transition-colors shrink-0"
        >
          View activity <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </Panel>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat Icon={Layers} tone="brand" label="Tracked" value={published.length} />
        <Stat Icon={Bot} tone="brand" label="Agent-sourced" value={agentSourced.length} />
        <Stat Icon={Gavel} tone="rose" label="Sanctions actions" value={actions.length} />
        <Stat Icon={Sparkles} tone="neutral" label="Added this week" value={thisWeek.length} />
      </div>

      <Panel className="p-4">
        <SectionHeading
          Icon={Flame}
          title="This week"
          sub="What moved in the last 7 days"
          right={
            <div className="flex items-center gap-2">
              <CopyButton
                text={digest}
                label="Copy digest"
                className="rounded-lg px-2.5 py-1.5 text-[11px] font-medium bg-white ring-1 ring-neutral-200 hover:bg-neutral-50"
              />
              <button
                onClick={downloadDigest}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium bg-white text-neutral-600 ring-1 ring-neutral-200 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
              >
                <Download className="h-3.5 w-3.5" /> .md
              </button>
            </div>
          }
        />
        {thisWeek.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {REGIMES.map((r) => {
              const n = thisWeek.filter((i) => i.regime === r).length;
              if (n === 0) return null;
              return (
                <button
                  key={r}
                  onClick={() => setPage(r)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 text-teal-700 ring-1 ring-teal-200 px-2.5 py-1 text-[12px] hover:bg-teal-100 transition-colors"
                >
                  {REGIME_META[r].label} <span className="text-teal-600/80 tabular-nums">{n} new</span>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-neutral-400">No new items in the last 7 days.</p>
        )}
      </Panel>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <SectionHeading Icon={LayoutDashboard} title="Regimes" sub="Jump into any view" />
          <div className="grid sm:grid-cols-2 gap-3">
            {REGIMES.map((r) => {
              const regimeItems = published.filter((i) => i.regime === r).sort(byIngestedDesc);
              const meta = REGIME_META[r];
              return (
                <button key={r} onClick={() => setPage(r)} className="text-left">
                  <Panel className="p-4 hover:ring-teal-300 transition-colors">
                    <div className="flex items-center gap-2 text-neutral-500">
                      <meta.Icon className="h-3.5 w-3.5 text-teal-700" strokeWidth={1.75} />
                      <span className="text-[13px] font-medium text-neutral-800">{meta.label}</span>
                      <span className="ml-auto text-[11px] tabular-nums text-neutral-400">{regimeItems.length}</span>
                    </div>
                    <p className="mt-1.5 text-[11px] text-neutral-500 truncate">{regimeItems[0]?.title ?? meta.blurb}</p>
                  </Panel>
                </button>
              );
            })}
            <button onClick={() => setPage("feed")} className="text-left sm:col-span-2">
              <Panel className="p-4 hover:ring-teal-300 transition-colors">
                <div className="flex items-center gap-2 text-neutral-500">
                  <List className="h-3.5 w-3.5 text-teal-700" strokeWidth={1.75} />
                  <span className="text-[13px] font-medium text-neutral-800">Full feed</span>
                  <span className="ml-auto text-[11px] tabular-nums text-neutral-400">{published.length}</span>
                </div>
                <p className="mt-1.5 text-[11px] text-neutral-500">Every tracked development, filterable by regime</p>
              </Panel>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <SectionHeading Icon={ShieldAlert} title="At a glance" />
          <Panel className="p-4">
            <SectionHeading Icon={ShieldAlert} title="Category mix" />
            <CategoryMix items={published} />
          </Panel>
          <Panel className="p-4">
            <SectionHeading Icon={List} title="By regime" />
            <MiniBars data={byRegime} />
          </Panel>
        </div>
      </div>

      <div>
        <SectionHeading Icon={Sparkles} title="Latest intelligence" sub="Most recently ingested, across every regime" />
        <div className="space-y-3">
          {latest.map((i) => (
            <div key={i.id} className="rise">
              <ItemCard item={i} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function byIngestedDesc(a: Item, b: Item) {
  if (a.addedAt !== b.addedAt) return a.addedAt < b.addedAt ? 1 : -1;
  return a.date < b.date ? 1 : -1;
}
