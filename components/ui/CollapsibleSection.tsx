"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

export function CollapsibleSection({
  title,
  subtitle,
  children,
  defaultOpen = false,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-[var(--color-border)] pt-4">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--color-navy)]">{title}</p>

          {subtitle && <p className="mt-1 text-xs text-[var(--color-muted)]">{subtitle}</p>}
        </div>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[var(--color-muted)] transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
