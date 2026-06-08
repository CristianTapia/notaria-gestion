"use client";

import { X } from "lucide-react";

export function Modal({
  open,
  title,
  description,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/40 p-3 sm:place-items-center">
      <button type="button" aria-label="Cerrar modal" className="absolute inset-0 cursor-default" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-2xl sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="break-words text-lg font-medium">{title}</h2>

            {description && <p className="mt-1 text-sm text-[var(--color-muted)]">{description}</p>}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--color-cream-input)] text-[var(--color-muted)] transition hover:text-[var(--color-navy)]"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
