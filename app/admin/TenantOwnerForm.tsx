import { UserPlus } from "lucide-react";
import { assignTenantOwner } from "./actions";

export default function TenantOwnerForm({ tenantId }: { tenantId: string }) {
  return (
    <form
      action={assignTenantOwner}
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-cream-input)]/60 p-4"
    >
      <input type="hidden" name="tenantId" value={tenantId} />

      <div className="mb-3 flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--color-gold)]/10 text-[var(--color-gold)]">
          <UserPlus className="h-4 w-4" />
        </div>

        <div>
          <p className="text-sm font-medium">Asignar dueño</p>
          <p className="text-xs text-[var(--color-muted)]">Invita al administrador de esta notaría.</p>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          name="email"
          type="email"
          required
          placeholder="correo del notario"
          className="h-10 min-w-0 flex-1 rounded-lg border border-[#DCD5C7] bg-white px-3 text-sm outline-none transition focus:border-[var(--color-navy)] focus:ring-4 focus:ring-[var(--color-navy)]/10"
        />

        <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--color-navy)] px-3 text-sm font-medium text-white transition hover:bg-[var(--color-navy-soft)]">
          <UserPlus className="h-4 w-4" />
          Invitar
        </button>
      </div>
    </form>
  );
}
