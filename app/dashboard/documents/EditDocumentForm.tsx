"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function EditDocumentForm({
  documentId,
  initialTitle,
  initialDescription,
}: {
  documentId: string;
  initialTitle: string;
  initialDescription: string | null;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);

    const { error } = await supabase
      .from("documents")
      .update({
        title,
        description: description.trim() || null,
      })
      .eq("id", documentId);

    setSaving(false);

    if (error) {
      alert(error.message);
    }
  };

  return (
    <div className="mt-4 space-y-3">
      <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-md border px-3 py-2" />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descripción"
        rows={2}
        className="w-full rounded-md border px-3 py-2"
      />

      <button type="button" onClick={save} disabled={saving} className="rounded-md border px-3 py-1.5 text-sm">
        {saving ? "Guardando..." : "Guardar cambios"}
      </button>
    </div>
  );
}
