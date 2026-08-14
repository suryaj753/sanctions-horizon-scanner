import { ShieldAlert, Gavel, CalendarClock } from "lucide-react";
import type { Item, Regime as RegimeId } from "../content/types";
import { REGIME_META, CATEGORY_META } from "../content/taxonomy";
import { PageHeader } from "../components/PageHeader";
import { DataTable } from "../components/DataTable";
import { Panel, Stat, SectionHeading } from "../lib/ui";
import { CategoryMix, MiniBars } from "../components/viz";
import { countBy } from "../lib/insights";
import { relativeDay } from "../lib/utils";

// One reusable view mounted per regime (UK/US/EU/UN) — a filtered lens over
// the single store. Adding a fifth regime later is a nav entry + this
// component parameterised, never new plumbing.
export function Regime({ regime, items }: { regime: RegimeId; items: Item[] }) {
  const meta = REGIME_META[regime];
  const all = items.filter((i) => i.status === "published" && i.regime === regime).sort((a, b) => (a.date < b.date ? 1 : -1));
  const byCategory = countBy(all, (i) => CATEGORY_META[i.category].label);
  const latest = all[0];

  return (
    <div className="space-y-4">
      <PageHeader
        Icon={meta.Icon}
        title={meta.label}
        subtitle={`${meta.blurb} — designations, licences, guidance and enforcement tracked for this regime.`}
        right={
          <span className="text-xs text-neutral-500 tabular-nums">
            {all.length} item{all.length === 1 ? "" : "s"}
          </span>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat Icon={meta.Icon} tone="brand" label="Tracked" value={all.length} />
        <Stat Icon={Gavel} tone="rose" label="Sanctions actions" value={all.filter((i) => i.category === "action").length} />
        <Stat
          Icon={ShieldAlert}
          tone="amber"
          label="Review screening"
          value={all.filter((i) => i.nextStep === "review-screening-lists").length}
        />
        <Stat Icon={CalendarClock} tone="neutral" label="Latest" value={latest ? relativeDay(latest.date) : "—"} />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <Panel className="p-4">
          <SectionHeading Icon={ShieldAlert} title="Category mix" />
          <CategoryMix items={all} />
        </Panel>
        <Panel className="p-4">
          <SectionHeading Icon={Gavel} title="By category" />
          <MiniBars data={byCategory} />
        </Panel>
      </div>

      {all.length > 0 ? <DataTable items={all} /> : <p className="text-sm text-neutral-400">No {meta.label} items tracked yet.</p>}
    </div>
  );
}
