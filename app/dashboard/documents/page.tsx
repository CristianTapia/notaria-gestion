import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import CreateDocumentForm from "./CreateDocumentsForm";
import DocumentActiveToggle from "./DocumentActiveToggle";
import EditDocumentForm from "./EditDocumentForm";
import CreateFieldForm from "./CreateFieldForm";
import EditFieldForm from "./EditFieldForm";

type RoleRow = {
  role: string;
  tenant_id: string | null;
};

type DocumentFieldRow = {
  id: string;
  label: string;
  field_type: string;
  required: boolean;
  placeholder: string | null;
  options: string[] | null;
  sort_order: number | null;
};

type DocumentRow = {
  id: string;
  title: string;
  description: string | null;
  active: boolean;
  created_at: string;
  document_fields: DocumentFieldRow[];
};

export default async function DashboardDocumentsPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: roles } = await supabase.from("user_roles").select("role, tenant_id").eq("user_id", user.id);

  const typedRoles = (roles ?? []) as RoleRow[];

  const tenantRole = typedRoles.find((role) => role.role === "tenant_owner");

  if (!tenantRole?.tenant_id) {
    redirect("/dashboard/requests");
  }

  const { data: documents, error } = await supabase
    .from("documents")
    .select(
      `
    id,
    title,
    description,
    active,
    created_at,
    document_fields (
      id,
      label,
      field_type,
      required,
      placeholder,
      options,
      sort_order
    )
  `,
    )
    .eq("tenant_id", tenantRole.tenant_id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const typedDocuments = (documents ?? []) as DocumentRow[];

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold">Documentos</h1>

      <CreateDocumentForm tenantId={tenantRole.tenant_id} />

      <div className="mt-6 space-y-4">
        {typedDocuments.length === 0 ? (
          <p className="text-gray-500">No hay documentos todavía.</p>
        ) : (
          typedDocuments.map((doc) => (
            <div key={doc.id} className="rounded-xl border p-4">
              <h2 className="font-semibold">{doc.title}</h2>

              <DocumentActiveToggle documentId={doc.id} initialActive={doc.active} />
              <EditDocumentForm documentId={doc.id} initialTitle={doc.title} initialDescription={doc.description} />

              {doc.description && <p className="text-sm text-gray-500">{doc.description}</p>}

              <div className="mt-4 rounded-lg border p-3">
                <h3 className="font-medium">Campos</h3>

                {doc.document_fields.length === 0 ? (
                  <p className="mt-2 text-sm text-gray-500">Este documento aún no tiene campos.</p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {doc.document_fields.map((field) => (
                      <EditFieldForm key={field.id} field={field} />
                    ))}
                  </ul>
                )}
              </div>

              <CreateFieldForm documentId={doc.id} nextSortOrder={(doc.document_fields?.length ?? 0) + 1} />

              <p className="mt-2 text-xs text-gray-400">Estado: {doc.active ? "Visible" : "Oculto"}</p>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
