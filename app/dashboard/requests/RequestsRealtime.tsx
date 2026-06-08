"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { playNotificationSound } from "./notification-sound";

export default function RequestsRealtime({
  tenantId,
  soundEnabled,
  onNewRequest,
}: {
  tenantId: string;
  soundEnabled: boolean;
  onNewRequest?: (requestId: string) => void;
}) {
  const router = useRouter();

  useEffect(() => {
    const channel = supabase
      .channel(`dashboard-requests-${tenantId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "document_requests",
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const requestId = typeof payload.new?.id === "string" ? payload.new.id : null;

            if (requestId) {
              onNewRequest?.(requestId);
            }

            if (soundEnabled) {
              playNotificationSound(2);
            }
          }

          router.refresh();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, router, soundEnabled, onNewRequest]);

  return null;
}
