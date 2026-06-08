"use client";

import { CheckCircle2, Info } from "lucide-react";
import { useEffect, useState } from "react";

import { Button, Card } from "@/components/ui";
import { saveClientRequest } from "@/lib/client-requests-storage";
import { supabase } from "@/lib/supabase";

type Field = {
  id: string;
  label: string;
  field_type: "text" | "email" | "phone" | "number" | "date" | "textarea" | "select";
  placeholder: string | null;
  required: boolean;
  options: string[] | null;
};

type Doc = {
  id: string;
  title: string;
  tenant_id: string;
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Recibida",
  in_progress: "En proceso",
  ready: "Lista",
  delivered: "Entregada",
  cancelled: "Cancelada",
};

function getInputType(fieldType: Field["field_type"]) {
  if (fieldType === "email") return "email";
  if (fieldType === "phone") return "tel";
  if (fieldType === "number") return "number";
  if (fieldType === "date") return "date";

  return "text";
}

export default function ClientDocumentForm({ doc, fields, slug }: { doc: Doc; fields: Field[]; slug: string }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [requestId, setRequestId] = useState<string | null>(null);
  const [trackingToken, setTrackingToken] = useState<string | null>(null);
  const [status, setStatus] = useState("pending");

  const refreshCurrentRequest = async () => {
    if (!requestId || !trackingToken) return;

    const { data, error } = await supabase.rpc("get_client_document_requests", {
      p_requests: [
        {
          request_id: requestId,
          tracking_token: trackingToken,
        },
      ],
    });

    if (error) return;

    const current = data?.[0];
    if (!current) return;

    setStatus(current.status ?? "pending");
  };

  useEffect(() => {
    if (!requestId || !trackingToken) return;

    const intervalId = window.setInterval(() => {
      refreshCurrentRequest();
    }, 30000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [requestId, trackingToken]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);

    const data: Record<string, string> = {};

    fields.forEach((field) => {
      data[field.label] = values[field.id] ?? "";
    });

    const { data: inserted, error } = await supabase.rpc("create_client_document_request", {
      p_document_id: doc.id,
      p_tenant_id: doc.tenant_id,
      p_data: data,
    });

    setSubmitting(false);

    if (error) {
      alert(error.message);
      return;
    }

    const request = inserted?.[0];

    if (!request) {
      alert("No se pudo obtener la solicitud creada.");
      return;
    }

    setRequestId(request.request_id);
    setTrackingToken(request.tracking_token);
    setStatus(request.status ?? "pending");

    saveClientRequest({
      requestId: request.request_id,
      trackingToken: request.tracking_token,
      tenantId: doc.tenant_id,
      slug,
      documentId: doc.id,
      documentTitle: request.document_title,
      status: request.status ?? "pending",
      createdAt: request.created_at,
    });
  };

  if (requestId) {
    return (
      <Card className="mt-8 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-green-100 text-green-700">
          <CheckCircle2 className="h-6 w-6" />
        </div>

        <p className="mt-4 text-sm text-[var(--color-muted)]">Solicitud enviada</p>

        <h2 className="mt-2 text-3xl font-normal tracking-[-0.03em]">{STATUS_LABEL[status] ?? status}</h2>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--color-muted)]">
          Puede mantener esta pantalla abierta para ver el estado actualizado automáticamente.
        </p>
      </Card>
    );
  }

  return (
    <Card className="mt-8">
      <form onSubmit={submit} className="space-y-5">
        {fields.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">Este documento no requiere información adicional.</p>
        ) : (
          fields.map((field) => (
            <div key={field.id}>
              <label className="mb-2 block text-sm font-medium">
                {field.label}
                {field.required && <span className="ml-1 text-[var(--color-gold)]">*</span>}
              </label>

              {field.field_type === "textarea" ? (
                <textarea
                  required={field.required}
                  rows={3}
                  placeholder={field.placeholder ?? ""}
                  value={values[field.id] ?? ""}
                  onChange={(e) => setValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                  className="w-full rounded-lg border border-[#DCD5C7] bg-[var(--color-cream-input)] px-3 py-2 text-sm outline-none transition focus:border-[var(--color-navy)] focus:ring-4 focus:ring-[var(--color-navy)]/10"
                />
              ) : field.field_type === "select" ? (
                <select
                  required={field.required}
                  value={values[field.id] ?? ""}
                  onChange={(e) => setValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                  className="h-11 w-full rounded-lg border border-[#DCD5C7] bg-[var(--color-cream-input)] px-3 text-sm outline-none transition focus:border-[var(--color-navy)] focus:ring-4 focus:ring-[var(--color-navy)]/10"
                >
                  <option value="">Seleccione</option>
                  {(field.options ?? []).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={getInputType(field.field_type)}
                  required={field.required}
                  placeholder={field.placeholder ?? ""}
                  value={values[field.id] ?? ""}
                  onChange={(e) => setValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                  className="h-11 w-full rounded-lg border border-[#DCD5C7] bg-[var(--color-cream-input)] px-3 text-sm outline-none transition focus:border-[var(--color-navy)] focus:ring-4 focus:ring-[var(--color-navy)]/10"
                />
              )}
            </div>
          ))
        )}

        <div className="rounded-xl border border-[#EAC77E] bg-[#FFF8E8] px-4 py-3 text-sm text-[#7A4A00]">
          <div className="flex gap-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p>Después de enviar verá una pantalla de seguimiento con el estado actualizado automáticamente.</p>
          </div>
        </div>

        <Button type="submit" disabled={submitting} className="h-12 w-full">
          {submitting ? "Enviando..." : "Enviar solicitud"}
        </Button>
      </form>
    </Card>
  );
}
