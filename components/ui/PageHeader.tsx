export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-8">
      {eyebrow && <p className="text-sm font-medium text-[var(--color-gold)]">{eyebrow}</p>}

      <div className="mt-2 flex items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-normal tracking-[-0.03em]">{title}</h1>
          {description && <p className="mt-2 text-sm text-[var(--color-muted)]">{description}</p>}
        </div>

        {children}
      </div>
    </header>
  );
}
