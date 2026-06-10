"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Select } from "@/components/ui";
import { supabase } from "@/lib/supabase";

type RequestStatus = "pending" | "in_progress" | "ready" | "delivered" | "cancelled";

const STATUS_OPTIONS: { value: RequestStatus; label: string }[] = [
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
  initialStatus: RequestStatus;
}) {
  const [status, setStatus] = useState<RequestStatus>(initialStatus);
  const [saving, setSaving] = useState(false);

  const isFinalStatus = status === "delivered" || status === "cancelled";

  const updateStatus = async (nextStatus: RequestStatus) => {
    if (isFinalStatus) {
      toast.error("Esta solicitud ya fue finalizada y no puede modificarse.");
      return;
    }

    setStatus(nextStatus);
    setSaving(true);

    const now = new Date().toISOString();

    const updatePayload: {
      status: RequestStatus;
      updated_at: string;
      delivered_at?: string | null;
      billing_status?: "pending" | "billable" | "non_billable" | "voided";
    } = {
      status: nextStatus,
      updated_at: now,
    };

    if (nextStatus === "delivered") {
      updatePayload.delivered_at = now;
      updatePayload.billing_status = "billable";
    }

    if (nextStatus === "cancelled") {
      updatePayload.billing_status = "non_billable";
    }

    const { error } = await supabase.from("document_requests").update(updatePayload).eq("id", requestId);

    setSaving(false);

    if (error) {
      toast.error(error.message);
      setStatus(initialStatus);
      return;
    }

    toast.success("Estado actualizado");
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <Select
        value={status}
        onChange={(e) => updateStatus(e.target.value as RequestStatus)}
        disabled={saving || isFinalStatus}
        className="sm:max-w-xs"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      {saving && <span className="text-xs text-[var(--color-muted)]">Guardando...</span>}

      {isFinalStatus && <span className="text-xs text-[var(--color-muted)]">Estado finalizado</span>}
    </div>
  );
}
