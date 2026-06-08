export function Switch({
  checked,
  disabled,
  loading,
  onClick,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex min-w-0 items-center gap-3 text-sm disabled:cursor-not-allowed disabled:opacity-70"
    >
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors duration-300 ${
          checked ? "bg-[var(--color-gold)]/80" : "bg-slate-300"
        }`}
      >
        <span
          className={`grid h-5 w-5 place-items-center rounded-full bg-white shadow-sm transition-transform duration-300 ease-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        >
          {loading && <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-gold)]" />}
        </span>
      </span>

      {label && <span className="min-w-[4.5rem] text-left text-sm text-[var(--color-muted)]">{label}</span>}
    </button>
  );
}
