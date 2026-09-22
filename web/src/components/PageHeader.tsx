import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { IconTile } from "../lib/ui";

// Big, thin, editorial page title with an optional icon and a
// plain-language descriptor. The descriptor doubles as the explanation
// of what each tab is.
export function PageHeader({
  Icon,
  title,
  subtitle,
  eyebrow,
  right,
}: {
  Icon?: LucideIcon;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3.5 min-w-0">
        {Icon && <IconTile Icon={Icon} tone="brand" size="lg" />}
        <div className="min-w-0">
          {eyebrow && <div className="text-[11px] uppercase tracking-[0.14em] text-teal-700/80 font-medium mb-1">{eyebrow}</div>}
          <h1 className="font-condensed text-[28px] sm:text-[34px] font-semibold tracking-tight text-neutral-900 leading-[1.1]">{title}</h1>
          {subtitle && <p className="mt-1.5 text-[13px] sm:text-sm text-neutral-500 font-light max-w-2xl">{subtitle}</p>}
        </div>
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}
