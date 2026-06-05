"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  getStoredClientRequests,
  isTerminalClientRequestStatus,
  mergeClientRequestStatusUpdates,
  type ClientRequestStatus,
  type StoredClientRequest,
} from "@/lib/client-requests-storage";

const STATUS_LABEL: Record<ClientRequestStatus, string> = {
  pending: "Recibida",
  in_progress: "En proceso",
  ready: "Listo",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export default function ClientRequestsList({ tenantId }: { tenantId: string }) {
  const [clientRequests, setClientRequests] = useState<StoredClientRequest[]>([]);

  const refreshClientRequests = useCallback(async () => {
    const stored = getStoredClientRequests(tenantId);

    if (stored.length === 0) {
      setClientRequests([]);
      return;
    }

    const { data, error } = await supabase.rpc("get_client_document_requests", {
      p_requests: stored.map((request) => ({
        request_id: request.requestId,
        tracking_token: request.trackingToken,
      })),
    });

    if (error) {
      setClientRequests(stored);
      return;
    }

    const next = mergeClientRequestStatusUpdates(tenantId, data ?? []);
    setClientRequests(next);
  }, [tenantId]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const stored = getStoredClientRequests(tenantId);

      if (stored.length === 0) {
        if (!cancelled) setClientRequests([]);
        return;
      }

      const { data, error } = await supabase.rpc("get_client_document_requests", {
        p_requests: stored.map((request) => ({
          request_id: request.requestId,
          tracking_token: request.trackingToken,
        })),
      });

      if (cancelled) return;

      if (error) {
        setClientRequests(stored);
        return;
      }

      const next = mergeClientRequestStatusUpdates(tenantId, data ?? []);
      setClientRequests(next);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [tenantId]);

  useEffect(() => {
    const hasActiveRequests = clientRequests.some((request) => !isTerminalClientRequestStatus(request.status));

    if (!hasActiveRequests) return;

    const intervalId = window.setInterval(() => {
      refreshClientRequests();
    }, 7000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshClientRequests();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [clientRequests, refreshClientRequests]);

  if (clientRequests.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Mis solicitudes</h2>
        <span className="text-xs text-gray-500">Actualización automática</span>
      </div>

      <div className="space-y-2">
        {clientRequests.map((request) => (
          <div key={request.requestId} className="flex items-center justify-between gap-3 rounded-xl border p-4">
            <div>
              <h3 className="font-medium">{request.documentTitle}</h3>
              <p className="text-xs text-gray-500">
                {new Date(request.createdAt).toLocaleString("es-ES", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>

            <span className="rounded-full border px-3 py-1 text-xs">{STATUS_LABEL[request.status]}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
