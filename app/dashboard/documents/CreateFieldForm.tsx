"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const FIELD_TYPES = [
  { value: "text", label: "Texto corto" },
  { value: "textarea", label: "Texto largo" },
  { value: "email", label: "Correo" },
  { value: "phone", label: "Teléfono" },
  { value: "number", label: "Número" },
  { value: "date", label: "Fecha" },
  { value: "select", label: "Lista" },
];

export default function CreateFieldForm({ documentId, nextSortOrder }: { documentId: string; nextSortOrder: number }) {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [fieldType, setFieldType] = useState("text");
  const [required, setRequired] = useState(false);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase.from("document_fields").insert({
      document_id: documentId,
      label,
      field_type: fieldType,
      required,
      sort_order: nextSortOrder,
      placeholder: null,
      options: fieldType === "select" ? ["Opción 1"] : null,
    });

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    setLabel("");
    setFieldType("text");
    setRequired(false);
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="mt-3 rounded-lg border p-3 space-y-3">
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        required
        placeholder="Texto de la pregunta"
        className="w-full rounded-md border px-3 py-2 text-sm"
      />

      <div className="flex gap-2">
        <select
          value={fieldType}
          onChange={(e) => setFieldType(e.target.value)}
          className="flex-1 rounded-md border px-3 py-2 text-sm"
        >
          {FIELD_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
          <input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} />
          Obligatoria
        </label>
      </div>

      <button disabled={saving} className="rounded-md bg-black px-3 py-2 text-sm text-white">
        {saving ? "Agregando..." : "Agregar pregunta"}
      </button>
    </form>
  );
}
