import { ExternalLink, Bot, User, Compass, MapPin, Quote, ShieldCheck } from "lucide-react";
import type { Item, Source, Confidence } from "../content/types";
import { CATEGORY_META, CONFIDENCE_META, SOURCE_KIND_META, NEXT_STEP_META } from "../content/taxonomy";
import { Badge } from "../lib/ui";
import { relativeDay, cn } from "../lib/utils";
import { citationText } from "../lib/export";
import { CopyButton } from "./CopyButton";

// The shared content block for an item. `header` draws the category/title
// row (off when a table row already shows it); `actions` adds the per-item
// copy affordance.
export function ItemDetail({
  item,
  header = true,
  actions = true,
  onTagClick,
}: {
  item: Item;
  header?: boolean;
  actions?: boolean;
  /** When set, tags render as buttons that invoke this (e.g. to filter a table). */
  onTagClick?: (tag: string) => void;
}) {
  const meta = CATEGORY_META[item.category];
  return (
    <div>
      {header && (
        <>
          <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-[11px] text-neutral-500">
            <Badge>{meta.label}</Badge>
            {item.verified && <VerifiedBadge />}
            <span className="inline-flex items-center gap-0.5">
              <MapPin className="h-3 w-3" /> {item.regime}
            </span>
            <span aria-hidden>·</span>
            <span>{relativeDay(item.date)}</span>
            {item.nextStep && (
              <span className={cn("ml-auto rounded-md px-1.5 py-0.5 font-medium", NEXT_STEP_META[item.nextStep].chip)}>
                {NEXT_STEP_META[item.nextStep].label}
              </span>
            )}
          </div>
          <h3 className="mt-1.5 text-sm font-semibold text-neutral-900 leading-snug">{item.title}</h3>
        </>
      )}

      <p className={cn("text-[13px] text-neutral-600 leading-relaxed", header && "mt-1")}>{item.summary}</p>

      {item.programme && (
        <div className="mt-2 flex items-center flex-wrap gap-2 text-[11px] text-neutral-500">
          <span className="font-medium text-neutral-700">Programme:</span> {item.programme}
        </div>
      )}

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
        {item.sources.map((s) => (
          <SourceLink key={s.url ?? s.name} source={s} />
        ))}
      </div>

      {actions && (
        <div className="mt-2 flex items-center justify-end gap-3">
          <CopyButton text={citationText(item)} label="Citation" Icon={Quote} />
        </div>
      )}
    </div>
  );
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
