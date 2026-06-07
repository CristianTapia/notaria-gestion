"use client";

import { UserPlus } from "lucide-react";

import { assignTenantOwner } from "./actions";
import { Button, Input } from "@/components/ui";

export default function TenantOwnerForm({ tenantId }: { tenantId: string }) {
  return (
    <form action={assignTenantOwner} className="mt-4 border-t border-[var(--color-border)] pt-4">
      <input type="hidden" name="tenantId" value={tenantId} />

      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
        Invitar dueño de notaría
      </p>

      <div className="flex gap-2">
        <Input name="email" type="email" required placeholder="correo@ejemplo.com" className="flex-1" />

        <Button type="submit">
          <UserPlus className="h-4 w-4" />
          Invitar
        </Button>
      </div>

      <p className="mt-2 text-xs text-[var(--color-muted)]">
        Si el correo no existe, se enviará una invitación para crear su contraseña.
      </p>
    </form>
  );
}
