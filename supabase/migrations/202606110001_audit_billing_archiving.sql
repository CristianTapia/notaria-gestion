alter table public.documents
add column if not exists archived_at timestamptz;

alter table public.document_fields
add column if not exists archived_at timestamptz;

alter table public.document_requests
add column if not exists document_title_snapshot text,
add column if not exists delivered_at timestamptz,
add column if not exists billing_status text not null default 'pending'
check (billing_status in ('pending', 'billable', 'non_billable', 'voided'));

update public.document_requests dr
set document_title_snapshot = d.title
from public.documents d
where dr.document_id = d.id
  and dr.document_title_snapshot is null;

update public.document_requests
set delivered_at = coalesce(delivered_at, updated_at),
    billing_status = 'billable'
where status = 'delivered';

update public.document_requests
set billing_status = 'non_billable'
where status = 'cancelled';

create index if not exists idx_documents_archived_at
on public.documents(archived_at);

create index if not exists idx_document_fields_archived_at
on public.document_fields(archived_at);

create index if not exists idx_document_requests_delivered_at
on public.document_requests(delivered_at);

create index if not exists idx_document_requests_billing_status
on public.document_requests(billing_status);