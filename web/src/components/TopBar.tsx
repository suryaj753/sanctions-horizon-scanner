import { Compass } from "lucide-react";

// Horizon is a single page now, so there is nothing left to navigate
// between — this is a slim static title strip, not a nav rail. Keeping it
// full-width (rather than a fixed left sidebar) leaves the horizontal room
// the master-detail layout below needs.
export function TopBar() {
  return (
    <header className="border-b border-neutral-200 bg-white sticky top-0 z-20">
      <div className="max-w-[1600px] mx-auto px-5 sm:px-8 py-3 flex items-center gap-2.5">
        <span className="grid place-items-center w-9 h-9 rounded-xl bg-teal-50 ring-1 ring-teal-200 text-teal-700 shrink-0">
          <Compass className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <div>
          <div className="font-condensed font-semibold text-neutral-900 text-base leading-none tracking-tight">Horizon</div>
          <div className="text-[10px] text-neutral-500 leading-none mt-1 font-light">Sanctions intelligence</div>
        </div>
      </div>
    </header>
  );
}
