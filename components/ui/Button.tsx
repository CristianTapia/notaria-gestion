type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy-soft)]",
  secondary: "border border-[var(--color-border)] text-[var(--color-ink)] hover:bg-[var(--color-cream-input)]",
  danger: "border border-red-200 text-red-600 hover:bg-red-50",
  ghost: "text-[var(--color-muted)] hover:bg-[var(--color-cream-input)] hover:text-[var(--color-navy)]",
};

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
}) {
  return (
    <button
      {...props}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
