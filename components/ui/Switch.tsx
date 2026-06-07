export function Switch({
  checked,
  disabled,
  onClick,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onClick?: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center gap-2 text-sm disabled:opacity-60"
    >
      <span
        className={`relative inline-flex h-6 w-11 rounded-full transition ${
          checked ? "bg-[var(--color-navy)]" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition ${
            checked ? "left-5" : "left-0.5"
          }`}
        />
      </span>

      {label && <span className="text-sm text-[var(--color-muted)]">{label}</span>}
    </button>
  );
}
