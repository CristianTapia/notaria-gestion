export type ClientRequestStatus = "pending" | "in_progress" | "ready" | "delivered" | "cancelled";

export type StoredClientRequest = {
  requestId: string;
  trackingToken: string;
  tenantId: string;
  slug: string;
  documentId: string;
  documentTitle: string;
  status: ClientRequestStatus;
  createdAt: string;
  updatedAt?: string;
};

type ClientRequestsPayload = {
  version: 1;
  requests: StoredClientRequest[];
};

export type ClientRequestStatusUpdate = {
  id: string;
  status: string;
  document_title: string;
  created_at: string;
  updated_at: string;
};

const MAX_REQUESTS = 20;
const MAX_AGE_MS = 48 * 60 * 60 * 1000;

function storageKey(tenantId: string) {
  return `notaria:client-requests:${tenantId}`;
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function isStatus(value: string): value is ClientRequestStatus {
  return ["pending", "in_progress", "ready", "delivered", "cancelled"].includes(value);
}

export function isTerminalClientRequestStatus(status: ClientRequestStatus) {
  return status === "delivered" || status === "cancelled";
}

export function pruneClientRequests(requests: StoredClientRequest[]) {
  const now = Date.now();
  const deduped = new Map<string, StoredClientRequest>();

  for (const request of requests) {
    const createdAt = new Date(request.createdAt).getTime();
    if (!Number.isFinite(createdAt) || now - createdAt > MAX_AGE_MS) continue;
    deduped.set(request.requestId, request);
  }

  return [...deduped.values()]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, MAX_REQUESTS);
}

export function getStoredClientRequests(tenantId: string) {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(storageKey(tenantId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<ClientRequestsPayload>;
    if (parsed.version !== 1 || !Array.isArray(parsed.requests)) return [];

    return pruneClientRequests(
      parsed.requests.filter((request): request is StoredClientRequest => (
        typeof request.requestId === "string"
        && typeof request.trackingToken === "string"
        && typeof request.tenantId === "string"
        && typeof request.slug === "string"
        && typeof request.documentId === "string"
        && typeof request.documentTitle === "string"
        && typeof request.createdAt === "string"
        && typeof request.status === "string"
        && isStatus(request.status)
      )),
    );
  } catch {
    return [];
  }
}

export function setStoredClientRequests(tenantId: string, requests: StoredClientRequest[]) {
  if (!canUseStorage()) return [];

  const next = pruneClientRequests(requests);
  const payload: ClientRequestsPayload = { version: 1, requests: next };
  window.localStorage.setItem(storageKey(tenantId), JSON.stringify(payload));
  return next;
}

export function saveClientRequest(request: StoredClientRequest) {
  const current = getStoredClientRequests(request.tenantId);
  return setStoredClientRequests(request.tenantId, [request, ...current]);
}

export function mergeClientRequestStatusUpdates(
  tenantId: string,
  updates: ClientRequestStatusUpdate[],
) {
  const current = getStoredClientRequests(tenantId);
  const byId = new Map(updates.map((update) => [update.id, update]));

  return setStoredClientRequests(
    tenantId,
    current.map((request) => {
      const update = byId.get(request.requestId);
      if (!update || !isStatus(update.status)) return request;

      return {
        ...request,
        status: update.status,
        documentTitle: update.document_title,
        createdAt: update.created_at,
        updatedAt: update.updated_at,
      };
    }),
  );
}
