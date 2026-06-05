import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ClientDocumentForm from "./ClientDocumentForm";

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
  description: string | null;
  tenant_id: string;
};

export default async function DocumentPage({ params }: { params: Promise<{ slug: string; documentId: string }> }) {
  const { slug, documentId } = await params;

  const [{ data: doc }, { data: fields }] = await Promise.all([
    supabase
      .from("documents")
      .select("id,title,description,tenant_id")
      .eq("id", documentId)
      .eq("active", true)
      .maybeSingle(),

    supabase
      .from("document_fields")
      .select("id,label,field_type,placeholder,required,options")
      .eq("document_id", documentId)
      .order("sort_order"),
  ]);

  if (!doc) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Este documento ya no está disponible.</p>
          <Link href={`/c/${slug}`}>Volver al listado</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto p-8">
      <Link href={`/c/${slug}`} className="text-sm text-gray-500">
        ← Otros documentos
      </Link>

      <ClientDocumentForm doc={doc} fields={(fields as Field[] | null) ?? []} slug={slug} />
    </main>
  );
}
