import { Clock, Inbox } from "lucide-react";
import { redirect } from "next/navigation";

import { Badge, Card, PageHeader } from "@/components/ui";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import RequestStatusSelect from "./RequestStatusSelect";
import RequestsRealtime from "./RequestsRealtime";

type RoleRow = {
  role: string;
  tenant_id: string | null;
};

type RequestStatus = "pending" | "in_progress" | "ready" | "delivered" | "cancelled";

type RequestRow = {
  id: string;
  status: RequestStatus;
  data: Record<string, unknown> | null;
  notes: string | null;
  created_at: string;
  documents: {
    title: string;
  } | null;
};

const STATUS_LABEL: Record<RequestStatus, string> = {
  pending: "Recibida",
  in_progress: "En proceso",
  ready: "Lista",
  delivered: "Entregada",
  cancelled: "Cancelada",
};

const STATUS_BADGE_VARIANT: Record<RequestStatus, "gold" | "blue" | "green" | "neutral" | "red"> = {
  pending: "gold",
  in_progress: "blue",
  ready: "green",
  delivered: "neutral",
  cancelled: "red",
};

function formatRequestDate(date: string) {
  return new Date(date).toLocaleString("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function DashboardRequestsPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: roles } = await supabase.from("user_roles").select("role, tenant_id").eq("user_id", user.id);

  const typedRoles = (roles ?? []) as RoleRow[];

  const tenantRole = typedRoles.find((role) => role.role === "tenant_owner" || role.role === "tenant_member");

  if (!tenantRole?.tenant_id) {
    redirect("/dashboard");
  }

  const { data: requests, error } = await supabase
    .from("document_requests")
    .select(
      `
      id,
      status,
      data,
      notes,
      created_at,
      documents (
        title
      )
    `,
    )
    .eq("tenant_id", tenantRole.tenant_id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const typedRequests = (requests ?? []) as unknown as RequestRow[];

  const pendingCount = typedRequests.filter(
    (request) => request.status === "pending" || request.status === "in_progress",
  ).length;

  return (
    <div>
      <RequestsRealtime tenantId={tenantRole.tenant_id} />

      <PageHeader
        eyebrow="Panel de atención"
        title="Solicitudes"
        description="Revisa y actualiza el estado de los documentos solicitados por clientes."
      >
        <div className="hidden rounded-2xl border border-[var(--color-border)] bg-white/80 px-5 py-3 text-right shadow-sm sm:block">
          <p className="text-2xl font-medium">{typedRequests.length}</p>
          <p className="text-xs text-[var(--color-muted)]">{pendingCount} activas</p>
        </div>
      </PageHeader>

      {typedRequests.length === 0 ? (
        <Card className="flex min-h-48 flex-col items-center justify-center text-center">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-[var(--color-gold)]/10 text-[var(--color-gold)]">
            <Inbox className="h-5 w-5" />
          </div>

          <p className="mt-4 font-medium">No hay solicitudes todavía</p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Cuando un cliente envíe una solicitud aparecerá aquí.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {typedRequests.map((request) => (
            <Card key={request.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="break-words text-base font-medium">{request.documents?.title ?? "Documento"}</h2>

                  <div className="mt-2 flex items-center gap-2 text-xs text-[var(--color-muted)]">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatRequestDate(request.created_at)}</span>
                  </div>
                </div>

                <Badge variant={STATUS_BADGE_VARIANT[request.status] ?? "neutral"}>
                  {STATUS_LABEL[request.status] ?? request.status}
                </Badge>
              </div>

              <div className="mt-4">
                <RequestStatusSelect
                  key={`${request.id}-${request.status}`}
                  requestId={request.id}
                  initialStatus={request.status}
                />
              </div>

              {request.data && (
                <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-cream-input)] p-4">
                  <p className="mb-3 text-xs font-medium text-[var(--color-muted)]">Datos enviados</p>

                  <dl className="grid gap-3">
                    {Object.entries(request.data).map(([key, value]) => (
                      <div key={key} className="min-w-0">
                        <dt className="text-xs text-[var(--color-muted)]">{key}</dt>
                        <dd className="break-words text-sm">{String(value || "—")}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
