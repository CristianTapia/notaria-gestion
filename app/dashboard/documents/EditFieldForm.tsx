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

type Field = {
  id: string;
  label: string;
  field_type: string;
  required: boolean;
  placeholder: string | null;
  options: string[] | null;
};

export default function EditFieldForm({ field }: { field: Field }) {
  const router = useRouter();

  const [label, setLabel] = useState(field.label);
  const [fieldType, setFieldType] = useState(field.field_type);
  const [required, setRequired] = useState(field.required);
  const [placeholder, setPlaceholder] = useState(field.placeholder ?? "");
  const [optionsText, setOptionsText] = useState((field.options ?? []).join(", "));
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);

    const options =
      fieldType === "select"
        ? optionsText
            .split(",")
            .map((option) => option.trim())
            .filter(Boolean)
        : null;

    const { error } = await supabase
      .from("document_fields")
      .update({
        label,
        field_type: fieldType,
        required,
        placeholder: placeholder.trim() || null,
        options,
      })
      .eq("id", field.id);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.refresh();
  };

  const remove = async () => {
    const confirmed = confirm("¿Eliminar esta pregunta?");
    if (!confirmed) return;

    setSaving(true);

    const { error } = await supabase.from("document_fields").delete().eq("id", field.id);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.refresh();
  };

  return (
    <div className="rounded-lg border p-3 space-y-3">
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
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

      <input
        value={placeholder}
        onChange={(e) => setPlaceholder(e.target.value)}
        placeholder="Texto de ayuda / placeholder"
        className="w-full rounded-md border px-3 py-2 text-sm"
      />

      {fieldType === "select" && (
        <input
          value={optionsText}
          onChange={(e) => setOptionsText(e.target.value)}
          placeholder="Opciones separadas por coma. Ej: Sí, No, No aplica"
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-md bg-black px-3 py-2 text-sm text-white"
        >
          {saving ? "Guardando..." : "Guardar pregunta"}
        </button>

        <button
          type="button"
          onClick={remove}
          disabled={saving}
          className="rounded-md border px-3 py-2 text-sm text-red-600"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
