import { Radio, Bot, Clock } from "lucide-react";
import type { Item } from "../content/types";
import { Panel, EmptyState } from "../lib/ui";
import { ItemCard } from "../components/ItemCard";
import { PageHeader } from "../components/PageHeader";

// Auto-publish mode: the agent publishes directly, so this is a
// transparency log (what it published, newest first) — not a gate.
export function Activity({ items, lastUpdated }: { items: Item[]; lastUpdated: string }) {
  const agent = items.filter((i) => i.addedBy === "agent" && i.status === "published").sort((a, b) => (a.addedAt < b.addedAt ? 1 : -1));

  return (
    <div className="space-y-4">
      <PageHeader
        Icon={Radio}
        title="Activity"
        subtitle="What the intelligence agent has published, newest first. It runs on a schedule and publishes automatically; this is a transparency log, with no gate in it."
      />

      <Panel className="p-3 flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" /> Last updated <span className="text-neutral-700 tabular-nums">{lastUpdated}</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Bot className="h-3.5 w-3.5" /> <span className="text-neutral-700 tabular-nums">{agent.length}</span> items from the agent
        </span>
        <span className="text-neutral-300">·</span>
        <span>Auto-publish (no human-in-the-loop)</span>
      </Panel>

      {agent.length === 0 ? (
        <EmptyState Icon={Radio} title="No agent activity yet" body="When the scheduled agent runs, the items it publishes appear here." />
      ) : (
        <div className="space-y-3">
          {agent.map((i) => (
            <div key={i.id} className="rise">
              <ItemCard item={i} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
