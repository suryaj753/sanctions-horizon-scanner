import { CheckCircle2, AlertTriangle, ChevronDown } from "lucide-react";
import type { CoverageEntry, CoverageStatus } from "../content/types";
import { Panel } from "../lib/ui";
import { TONE } from "../lib/uiTokens";
import { cn, longDate } from "../lib/utils";

const STATUS_LABEL: Record<CoverageStatus, string> = {
  checked: "Checked",
  partial: "Partially checked",
  unreachable: "Unreachable",
};

function incompleteCoverage(coverage: CoverageEntry[]) {
  return coverage.filter((c) => c.status !== "checked");
}

// Header-level summary: neutral when every registry source was read, amber
// when any wasn't, so "nothing new" is never mistaken for "nothing happened".
export function CoverageButton({
  coverage,
  open,
  onToggle,
}: {
  coverage: CoverageEntry[];
  open: boolean;
  onToggle: () => void;
}) {
  const gaps = incompleteCoverage(coverage);
  if (gaps.length === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
        <CheckCircle2 className="h-3.5 w-3.5 text-neutral-400" /> All {coverage.length} sources checked
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls="coverage-panel"
      className={cn("inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors", TONE.amber.tile)}
    >
      <AlertTriangle className="h-3.5 w-3.5" />
      {gaps.length} of {coverage.length} sources not fully checked
      <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
    </button>
  );
}

export function CoveragePanel({ coverage }: { coverage: CoverageEntry[] }) {
  const gaps = incompleteCoverage(coverage);
  return (
    <Panel className="p-4">
      <div id="coverage-panel">
        <p className="text-[12px] text-neutral-600">
          These sources could not be fully read in the latest check, so developments from them may be missing. Check them by hand before relying
          on an absence of news.
        </p>
        <ul className="mt-3 divide-y divide-neutral-100">
          {gaps.map((c) => (
            <li key={c.sourceId} className="py-2 flex flex-col sm:flex-row sm:items-baseline gap-x-3 gap-y-0.5 text-[12px]">
              <span className="font-medium text-neutral-800 sm:w-64 shrink-0">
                {c.name} <span className="text-neutral-400 font-normal">· {c.regime}</span>
              </span>
              <span className={cn("shrink-0 font-medium", TONE.amber.text)}>{STATUS_LABEL[c.status]}</span>
              <span className="text-neutral-500 flex-1">{c.note}</span>
              <span className="font-mono text-[11px] text-neutral-400 shrink-0">{longDate(c.checkedAt)}</span>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}
