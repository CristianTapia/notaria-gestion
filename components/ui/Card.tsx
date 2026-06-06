export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-[var(--color-border)] bg-white/80 p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}
