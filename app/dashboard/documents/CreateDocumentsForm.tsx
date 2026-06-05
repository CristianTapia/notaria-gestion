"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CreateDocumentForm({ tenantId }: { tenantId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase.from("documents").insert({
      tenant_id: tenantId,
      title,
      description: null,
      active: true,
    });

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    setTitle("");
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="mt-6 flex gap-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        placeholder="Nombre del documento"
        className="flex-1 rounded-md border px-3 py-2"
      />

      <button disabled={saving} className="rounded-md bg-black px-4 py-2 text-white">
        {saving ? "Creando..." : "Crear"}
      </button>
    </form>
  );
}
