"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DocumentActiveToggle({
  documentId,
  initialActive,
}: {
  documentId: string;
  initialActive: boolean;
}) {
  const [active, setActive] = useState(initialActive);
  const [saving, setSaving] = useState(false);

  const toggle = async () => {
    const nextActive = !active;

    setActive(nextActive);
    setSaving(true);

    const { error } = await supabase.from("documents").update({ active: nextActive }).eq("id", documentId);

    setSaving(false);

    if (error) {
      alert(error.message);
      setActive(active);
    }
  };

  return (
    <button type="button" onClick={toggle} disabled={saving} className="mt-3 rounded-md border px-3 py-1.5 text-sm">
      {saving ? "Guardando..." : active ? "Visible" : "Oculto"}
    </button>
  );
}
