import { useState } from "react";
import { Sidebar, type Page } from "./components/Sidebar";
import { ALL_ITEMS, FEED_META } from "./content";
import { Overview } from "./views/Overview";
import { Feed } from "./views/Feed";
import { Regime } from "./views/Regime";
import { Activity } from "./views/Activity";

const REGIME_PAGES = ["UK", "US", "EU", "UN"] as const;

export function App() {
  const [page, setPage] = useState<Page>("overview");
  const items = ALL_ITEMS;

  // "New" indicator: agent items published in the last 2 days.
  const badgeCount = items.filter((i) => i.addedBy === "agent" && i.status === "published" && withinDays(i.addedAt, 2)).length;

  return (
    <div className="md:flex min-h-screen text-neutral-900">
      <Sidebar page={page} setPage={setPage} badgeCount={badgeCount} />
      <main className="flex-1 min-w-0">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8" key={page}>
          {page === "overview" && <Overview items={items} setPage={setPage} lastUpdated={FEED_META.lastUpdated} />}
          {page === "feed" && <Feed items={items} />}
          {REGIME_PAGES.includes(page as (typeof REGIME_PAGES)[number]) && (
            <Regime regime={page as (typeof REGIME_PAGES)[number]} items={items} />
          )}
          {page === "activity" && <Activity items={items} lastUpdated={FEED_META.lastUpdated} />}
        </div>
      </main>
    </div>
  );
}

function withinDays(iso: string, days: number, now = new Date()) {
  const d = new Date(iso + "T00:00:00").getTime();
  return now.getTime() - d <= days * 86_400_000;
}
