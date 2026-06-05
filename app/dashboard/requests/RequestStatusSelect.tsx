"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

const STATUS_OPTIONS = [
  { value: "pending", label: "Recibida" },
  { value: "in_progress", label: "En proceso" },
  { value: "ready", label: "Lista" },
  { value: "delivered", label: "Entregada" },
  { value: "cancelled", label: "Cancelada" },
];

export default function RequestStatusSelect({
  requestId,
  initialStatus,
}: {
  requestId: string;
  initialStatus: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [saving, setSaving] = useState(false);

  const updateStatus = async (nextStatus: string) => {
    setStatus(nextStatus);
    setSaving(true);

    const { error } = await supabase
      .from("document_requests")
      .update({
        status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    setSaving(false);

    if (error) {
      alert(error.message);
      setStatus(initialStatus);
      return;
    }
  };

  return (
    <div className="mt-3 flex items-center gap-2">
      <select
        value={status}
        onChange={(e) => updateStatus(e.target.value)}
        disabled={saving}
        className="rounded-md border px-3 py-2 text-sm"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {saving && <span className="text-xs text-gray-500">Guardando...</span>}
    </div>
  );
}
