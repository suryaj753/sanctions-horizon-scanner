import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// The one class-name helper.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Friendly relative day label for item dates (e.g. "today", "3d ago").
export function relativeDay(iso: string, now = new Date()): string {
  const d = new Date(iso + "T00:00:00");
  const days = Math.round((startOfDay(now) - d.getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

// Full date for exports/citations (e.g. "3 June 2026"). Distinct from the
// in-UI relativeDay — exported docs need an absolute, unambiguous date.
export function longDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// True if `iso` (yyyy-mm-dd) is within the last `days` days.
export function withinDays(iso: string, days: number, now = new Date()) {
  const d = new Date(iso + "T00:00:00").getTime();
  return now.getTime() - d <= days * 86_400_000;
}
