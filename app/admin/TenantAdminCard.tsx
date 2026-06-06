"use client";

import { Check, Eye, EyeOff, Pencil, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Button, Card, Input } from "@/components/ui";

import { deleteTenant, updateTenant } from "./actions";
import TenantOwnerForm from "./TenantOwnerForm";

type TenantRow = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  created_at: string;
};

function createSlugPreview(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function TenantAdminCard({ tenant }: { tenant: TenantRow }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(tenant.name);
  const [active, setActive] = useState(tenant.active);

  const nextSlug = useMemo(() => createSlugPreview(name), [name]);
  const slugWillChange = editing && nextSlug !== tenant.slug;

  const cancelEdit = () => {
    setName(tenant.name);
    setActive(tenant.active);
    setEditing(false);
  };

  return (
    <Card>
      <form action={updateTenant} className="space-y-4">
        <input type="hidden" name="id" value={tenant.id} />
        <input type="hidden" name="currentSlug" value={tenant.slug} />
        <input type="hidden" name="active" value={active ? "on" : ""} />

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {editing ? (
              <Input name="name" required value={name} onChange={(e) => setName(e.target.value)} className="max-w-md" />
            ) : (
              <>
                <input type="hidden" name="name" value={tenant.name} />
                <h2 className="text-base font-medium">{tenant.name}</h2>
              </>
            )}

            <div className="mt-1 space-y-1 text-xs text-[var(--color-muted)]">
              <p className="font-mono">/c/{tenant.slug}</p>

              {slugWillChange && (
                <p className="font-mono text-[var(--color-gold)]">Nuevo: /c/{nextSlug || tenant.slug}</p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              disabled={!editing}
              onClick={() => setActive((prev) => !prev)}
              className={`inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-medium transition ${
                active ? "bg-[#F5E9D6] text-[var(--color-navy)]" : "bg-slate-100 text-slate-500"
              } ${editing ? "hover:opacity-80" : "cursor-default"}`}
            >
              {active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {active ? "Activa" : "Inactiva"}
            </button>

            <Button
              type="button"
              variant={editing ? "secondary" : "ghost"}
              onClick={() => (editing ? cancelEdit() : setEditing(true))}
              className="h-10 w-10 px-0"
              aria-label={editing ? "Cancelar edición" : "Editar notaría"}
            >
              {editing ? <X className="h-5 w-5" /> : <Pencil className="h-5 w-5" />}
            </Button>

            <Button
              form={`delete-tenant-${tenant.id}`}
              variant="ghost"
              className="h-10 w-10 px-0 hover:text-red-600"
              aria-label="Eliminar notaría"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {slugWillChange && (
          <div className="rounded-xl border border-[#EAC77E] bg-[#FFF8E8] p-3 text-sm text-[#7A4A00]">
            <p className="font-medium">Advertencia</p>
            <p className="mt-1">Cambiar el nombre modificará el link público. El QR anterior dejará de funcionar.</p>

            <label className="mt-3 flex items-start gap-2">
              <input type="checkbox" name="confirmSlugChange" className="mt-1" required />
              <span>Entiendo que será necesario generar/imprimir un nuevo QR.</span>
            </label>
          </div>
        )}

        {editing && (
          <div className="flex flex-wrap gap-2">
            <Button>
              <Check className="h-4 w-4" />
              Guardar cambios
            </Button>
          </div>
        )}
      </form>

      <form id={`delete-tenant-${tenant.id}`} action={deleteTenant}>
        <input type="hidden" name="id" value={tenant.id} />
      </form>

      <div className="mt-4 border-t border-[var(--color-border)] pt-4">
        <TenantOwnerForm tenantId={tenant.id} />
      </div>
    </Card>
  );
}
