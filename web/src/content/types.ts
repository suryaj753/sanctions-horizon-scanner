// ---------------------------------------------------------------
// One content model, one view family.
//
// Every tracked development — a designation, a licence change, a
// statutory instrument, a Security Council resolution — is the SAME
// shape with a `regime` and `category` discriminator. Tabs (per-regime
// views, the combined Feed, Activity) are filtered views over this one
// store, and the ingestion agent only ever emits `Item`s.
// ---------------------------------------------------------------

export type Regime = "UK" | "US" | "EU" | "UN";

export type Category = "action" | "regulatory-update" | "geopolitical";

/** How the source registry classifies a source, not the item itself. */
export type SourceType = "primary-list" | "guidance" | "enforcement" | "legislation" | "press-political";

export type Status = "published" | "pending" | "rejected";

export type AddedBy = "agent" | "human";

// How confident we are in the item itself — distinct from `nextStep`.
export type Confidence = "high" | "medium" | "low";

// A starting point for the reader, never a compliance determination.
export type NextStep = "review-screening-lists" | "monitor-only" | "assess-framework-impact";

export interface Source {
  name: string;
  url?: string;
  /** primary = the official / originating document; secondary = reporting or analysis about it. */
  kind?: "primary" | "secondary";
}

export interface Item {
  id: string;
  regime: Regime;
  category: Category;
  title: string;
  /** Plain-language headline/summary. */
  summary: string;
  /** Potential organisational impact for a regulated bank. */
  whyItMatters?: string;
  /** A starting point for triage, not a compliance determination. */
  nextStep?: NextStep;
  /** Event / publication date (ISO yyyy-mm-dd). */
  date: string;
  /** When it entered Horizon (ISO yyyy-mm-dd). */
  addedAt: string;
  addedBy: AddedBy;
  status: Status;
  /** Relevant jurisdiction(s) / sanctions programme(s), e.g. "Russia — cyber-related". */
  programme?: string;
  /** Trust in the item, separate from nextStep. Optional; shown as a subtle signal. */
  confidence?: Confidence;
  /** A human has reviewed and vouched for this item. Never set by the agent. */
  verified?: boolean;
  /** Named individuals/entities the item is specifically about, when known from the source. Omit rather than guess. */
  entities?: string[];
  tags: string[];
  sources: Source[];
}
