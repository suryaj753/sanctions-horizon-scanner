import { Gavel, Scale, Globe2, Landmark, Flag, type LucideIcon } from "lucide-react";
import type { Regime, Category, Confidence, NextStep } from "./types";

// Label + icon metadata per category. The UI is monochrome by design
// (rows are told apart by icon + label, not colour), so there is no
// per-category accent here.
export const CATEGORY_META: Record<Category, { label: string; plural: string; Icon: LucideIcon; blurb: string }> = {
  action: {
    label: "Sanctions Action",
    plural: "Sanctions Actions",
    Icon: Gavel,
    blurb: "Designations, delistings, licences, enforcement",
  },
  "regulatory-update": {
    label: "Regulatory Update",
    plural: "Regulatory Updates",
    Icon: Scale,
    blurb: "Guidance, frameworks, reporting & legislative change",
  },
  geopolitical: {
    label: "Geopolitical Development",
    plural: "Geopolitical Developments",
    Icon: Globe2,
    blurb: "Resolutions, executive actions & political decisions",
  },
};

export const REGIME_META: Record<Regime, { label: string; fullName: string; blurb: string; Icon: LucideIcon }> = {
  UK: { label: "UK", fullName: "United Kingdom", blurb: "HM Treasury, OFSI & OTSI", Icon: Landmark },
  US: { label: "US", fullName: "United States", blurb: "OFAC, US Treasury & the White House", Icon: Landmark },
  EU: { label: "EU", fullName: "European Union", blurb: "Council, Commission, EUR-Lex & the CJEU", Icon: Flag },
  UN: { label: "UN", fullName: "United Nations", blurb: "Security Council & sanctions committees", Icon: Globe2 },
};

// A starting point for the reader — deliberately hedged labels, never
// phrased as a determination the tool has made for them.
export const NEXT_STEP_META: Record<NextStep, { label: string; chip: string }> = {
  "review-screening-lists": {
    label: "Review screening lists",
    chip: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  },
  "monitor-only": {
    label: "Monitor only",
    chip: "bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200",
  },
  "assess-framework-impact": {
    label: "Assess framework impact",
    chip: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  },
};

// Confidence — a trust signal, distinct from the next-step flag. A single
// dot scales accent → grey.
export const CONFIDENCE_META: Record<Confidence, { label: string; dot: string }> = {
  high: { label: "High confidence", dot: "bg-teal-600" },
  medium: { label: "Medium confidence", dot: "bg-neutral-400" },
  low: { label: "Low confidence", dot: "bg-neutral-300" },
};

// Source provenance — a primary (originating/official) source is
// emphasised; secondary reporting is muted.
export const SOURCE_KIND_META: Record<"primary" | "secondary", { label: string; chip: string }> = {
  primary: { label: "Primary", chip: "bg-teal-50 text-teal-700 ring-1 ring-teal-200" },
  secondary: { label: "Secondary", chip: "bg-neutral-100 text-neutral-500 ring-1 ring-neutral-200" },
};
