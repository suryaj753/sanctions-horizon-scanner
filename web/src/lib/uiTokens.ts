// ---------------------------------------------------------------
// Visual tokens — clean, neutral, light.
//
// Distinct from both sibling apps: the Compliance Engine (light + blue)
// and Sentinel (dark + violet). White/neutral-50 base, a single muted
// teal accent, amber/rose used sparingly for the next-step flag only —
// this is an operational reading tool for a bank team, not a dashboard
// that needs to compete for attention. Tailwind v4 only sees literal
// class strings, so every variant is enumerated here.
// ---------------------------------------------------------------

export const ACCENT = {
  text: "text-teal-700",
  textBright: "text-teal-600",
  bg: "bg-teal-600",
  dot: "bg-teal-600",
  soft: "bg-teal-50 text-teal-700 ring-1 ring-teal-200",
  bar: "bg-teal-600",
} as const;

export type Tone = "brand" | "amber" | "rose" | "neutral";

export const TONE: Record<Tone, { tile: string; text: string; dot: string; bar: string }> = {
  brand: {
    tile: "bg-teal-50 text-teal-700 ring-1 ring-teal-200",
    text: "text-teal-700",
    dot: "bg-teal-600",
    bar: "bg-teal-600",
  },
  amber: {
    tile: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    text: "text-amber-700",
    dot: "bg-amber-500",
    bar: "bg-amber-500",
  },
  rose: {
    tile: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    text: "text-rose-700",
    dot: "bg-rose-500",
    bar: "bg-rose-500",
  },
  neutral: {
    tile: "bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200",
    text: "text-neutral-600",
    dot: "bg-neutral-400",
    bar: "bg-neutral-400",
  },
};
