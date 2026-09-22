import type { ReactNode } from "react";
import { ExternalLink, Bot, User, Compass, MapPin, Quote, ShieldCheck } from "lucide-react";
import type { Item, Source, Confidence } from "../content/types";
import { CATEGORY_META, CONFIDENCE_META, SOURCE_KIND_META, NEXT_STEP_META, REGIME_META } from "../content/taxonomy";
import { Badge } from "../lib/ui";
import { relativeDay, longDate, cn } from "../lib/utils";
import { citationText } from "../lib/export";
import { CopyButton } from "./CopyButton";

// The detail pane for one selected item — the right column of the
// master-detail layout. Exactly three sections, in this order: Source
// Classification, Executive Summary, Designated Entities (when present).
export function ItemDetail({
  item,
  onTagClick,
}: {
  item: Item;
  /** When set, tags render as buttons that invoke this (e.g. to filter the list). */
  onTagClick?: (tag: string) => void;
}) {
  const meta = CATEGORY_META[item.category];
  return (
    <div>
      <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-[11px] text-neutral-500">
        <Badge>{meta.label}</Badge>
        {item.verified && <VerifiedBadge />}
        <span className="inline-flex items-center gap-0.5">
          <MapPin className="h-3 w-3" /> {item.regime}
        </span>
        <span aria-hidden>·</span>
        <span className="font-mono">{relativeDay(item.date)}</span>
        {item.nextStep && (
          <span className={cn("ml-auto rounded-md px-1.5 py-0.5 font-medium", NEXT_STEP_META[item.nextStep].chip)}>
            {NEXT_STEP_META[item.nextStep].label}
          </span>
        )}
      </div>
      <h2 className="mt-1.5 font-condensed font-semibold text-xl sm:text-2xl text-neutral-900 leading-snug">{item.title}</h2>

      {/* 1. Source Classification */}
      <div className="mt-3 rounded-lg bg-neutral-50 ring-1 ring-neutral-200 p-3">
        <SectionLabel>Source classification</SectionLabel>
        <dl className="space-y-1.5">
          <ClassificationRow label="Source">{item.sources[0]?.name ?? "—"}</ClassificationRow>
          <ClassificationRow label="Jurisdiction">{REGIME_META[item.regime].fullName}</ClassificationRow>
          {item.programme && <ClassificationRow label="Programme">{item.programme}</ClassificationRow>}
          <ClassificationRow label="Published" mono>
            {longDate(item.date)}
          </ClassificationRow>
          <ClassificationRow label="Document type">{meta.label}</ClassificationRow>
          <ClassificationRow label="Reference ID" mono>
            {item.id}
          </ClassificationRow>
          {item.sources[0]?.url && (
            <ClassificationRow label="Source URL" mono>
              <a href={item.sources[0].url} target="_blank" rel="noreferrer" className="text-teal-700 hover:underline break-all">
                {item.sources[0].url}
              </a>
            </ClassificationRow>
          )}
        </dl>
        {item.sources.length > 0 && (
          <div className="mt-2.5 pt-2.5 border-t border-neutral-200 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {item.sources.map((s) => (
              <SourceLink key={s.url ?? s.name} source={s} />
            ))}
          </div>
        )}
      </div>

      {/* 2. Executive Summary */}
      <div className="mt-3 rounded-lg bg-neutral-50 ring-1 ring-neutral-200 p-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          {item.confidence && <span className={cn("h-1.5 w-1.5 rounded-full", CONFIDENCE_META[item.confidence].dot)} aria-hidden />}
          <SectionLabel className="mb-0">Executive summary · {item.addedBy === "agent" ? "Agent-drafted" : "Human-curated"}</SectionLabel>
        </div>
        <p className="text-[13px] text-neutral-600 leading-relaxed">{item.summary}</p>

        {item.whyItMatters && (
          <div className="mt-2.5 flex gap-2 rounded-lg bg-teal-50/60 border-l-2 border-teal-500 px-3 py-2">
            <Compass className="h-3.5 w-3.5 text-teal-700 mt-0.5 shrink-0" />
            <p className="text-[12px] text-neutral-700 leading-relaxed">
              <span className="font-semibold text-neutral-900">Why this matters: </span>
              {item.whyItMatters}
            </p>
          </div>
        )}

        <div className="mt-2.5 flex items-center flex-wrap gap-x-3 gap-y-1.5">
          <div className="flex items-center flex-wrap gap-1">
            {item.tags.slice(0, 4).map((t) =>
              onTagClick ? (
                <button
                  key={t}
                  onClick={() => onTagClick(t)}
                  className="text-[10px] text-neutral-500 bg-neutral-100 rounded px-1.5 py-0.5 hover:bg-neutral-200 hover:text-teal-700 transition-colors"
                  title={`Filter by "${t}"`}
                >
                  {t}
                </button>
              ) : (
                <span key={t} className="text-[10px] text-neutral-500 bg-neutral-100 rounded px-1.5 py-0.5">
                  {t}
                </span>
              ),
            )}
          </div>
          {item.confidence && <ConfidenceTag confidence={item.confidence} className="ml-auto" />}
          <span className={cn("inline-flex items-center gap-1 text-[10px] text-neutral-400", !item.confidence && "ml-auto")}>
            {item.addedBy === "agent" ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}
            {item.addedBy === "agent" ? "agent" : "curated"}
          </span>
        </div>
      </div>

      {/* 3. Designated Entities — only when present */}
      {item.entities && item.entities.length > 0 && (
        <div className="mt-3 rounded-lg bg-neutral-50 ring-1 ring-neutral-200 p-3">
          <SectionLabel>Designated entities ({item.entities.length})</SectionLabel>
          <ul className="space-y-1">
            {item.entities.map((e) => (
              <li key={e} className="text-[12px] text-neutral-700 flex items-start gap-1.5">
                <span className="text-rose-400 mt-1" aria-hidden>
                  ▪
                </span>
                {e}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-3 flex items-center justify-end gap-3">
        <CopyButton text={citationText(item)} label="Citation" Icon={Quote} />
      </div>
    </div>
  );
}

// Uppercase micro-label in mono — the small-caps section headers throughout
// the detail pane (Source classification / Executive summary / Designated
// entities), matching the monospace-metadata half of the type contrast.
function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("text-[10px] uppercase tracking-wide font-mono text-neutral-500 font-semibold mb-2", className)}>{children}</div>;
}

// Human-vouched marker.
function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 text-teal-700 ring-1 ring-teal-200 px-1.5 py-0.5 text-[10px] font-medium">
      <ShieldCheck className="h-3 w-3" /> Verified
    </span>
  );
}

function ConfidenceTag({ confidence, className }: { confidence: Confidence; className?: string }) {
  const c = CONFIDENCE_META[confidence];
  return (
    <span className={cn("inline-flex items-center gap-1 text-[10px] text-neutral-500", className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} /> {c.label}
    </span>
  );
}

function ClassificationRow({ label, children, mono }: { label: string; children: ReactNode; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5 text-[12px]">
      <dt className="text-neutral-400">{label}</dt>
      <dd className={cn("text-neutral-700", mono && "font-mono")}>{children}</dd>
    </div>
  );
}

function SourceLink({ source }: { source: Source }) {
  return (
    <span className="inline-flex items-center gap-1">
      <a
        href={source.url}
        target="_blank"
        rel="noreferrer"
        className={cn(
          "inline-flex items-center gap-1 text-[10px] text-neutral-500 hover:text-teal-700",
          !source.url && "pointer-events-none text-neutral-300",
        )}
      >
        <ExternalLink className="h-3 w-3" /> {source.name}
      </a>
      {source.kind && (
        <span className={cn("rounded px-1 py-0.5 text-[9px] font-medium uppercase tracking-wide", SOURCE_KIND_META[source.kind].chip)}>
          {SOURCE_KIND_META[source.kind].label}
        </span>
      )}
    </span>
  );
}
