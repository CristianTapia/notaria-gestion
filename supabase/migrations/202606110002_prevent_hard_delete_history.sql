create or replace function public.prevent_delete_document_with_requests()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if exists (
    select 1
    from public.document_requests dr
    where dr.document_id = old.id
  ) then
    raise exception 'No se puede eliminar un documento con solicitudes históricas. Archívalo en su lugar.'
      using errcode = 'P0001';
  end if;

  return old;
end;
$$;

drop trigger if exists prevent_delete_document_with_requests_trigger
on public.documents;

create trigger prevent_delete_document_with_requests_trigger
before delete on public.documents
for each row
execute function public.prevent_delete_document_with_requests();


create or replace function public.prevent_delete_field_with_requests()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if exists (
    select 1
    from public.document_requests dr
    where dr.document_id = old.document_id
  ) then
    raise exception 'No se puede eliminar un campo de un documento con solicitudes históricas. Archívalo en su lugar.'
      using errcode = 'P0001';
  end if;

  return old;
end;
$$;

drop trigger if exists prevent_delete_field_with_requests_trigger
on public.document_fields;

create trigger prevent_delete_field_with_requests_trigger
before delete on public.document_fields
for each row
execute function public.prevent_delete_field_with_requests();