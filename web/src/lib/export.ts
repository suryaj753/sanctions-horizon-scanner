import type { Item } from "../content/types";
import { longDate } from "./utils";

// Turn Items into things a bank compliance team can paste into an email or
// tracking sheet. Kept deliberately small: a citation string and the two
// side-effects (clipboard, download) shared by every copy affordance.

function sourcesInline(item: Item): string {
  if (item.sources.length === 0) return "source not recorded";
  return item.sources.map((s) => (s.url ? `${s.name}, ${s.url}` : s.name)).join("; ");
}

// A pasteable citation for one item — title, source(s), absolute date.
export function citationText(item: Item): string {
  return `"${item.title}", ${sourcesInline(item)} (${longDate(item.date)}).`;
}

// Copy to clipboard with a legacy fallback (older/embedded webviews).
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

// Trigger a client-side file download.
export function downloadText(filename: string, text: string, mime = "text/plain") {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
