import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ClientRequestsList from "./ClientRequestsList";

type Tenant = {
  id: string;
  name: string;
  slug: string;
};

type Doc = {
  id: string;
  title: string;
  description: string | null;
};

export default async function ClientListPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id,name,slug")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1>Notaría no encontrada</h1>
      </div>
    );
  }

  const { data: docs } = await supabase
    .from("documents")
    .select("id,title,description")
    .eq("tenant_id", tenant.id)
    .eq("active", true)
    .order("sort_order")
    .order("created_at");

  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">{tenant.name}</h1>

      <ClientRequestsList tenantId={tenant.id} />

      <div className="space-y-4">
        {docs?.map((doc) => (
          <Link key={doc.id} href={`/c/${slug}/${doc.id}`} className="block border rounded-lg p-4 hover:bg-gray-50">
            <h2 className="font-semibold">{doc.title}</h2>

            {doc.description && <p className="text-sm text-gray-500">{doc.description}</p>}
          </Link>
        ))}
      </div>
    </main>
  );
}
