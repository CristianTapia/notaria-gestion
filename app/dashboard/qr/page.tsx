import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import QrGenerator from "./QrGenerator";

type RoleRow = {
  role: string;
  tenant_id: string | null;
};

type TenantRow = {
  id: string;
  slug: string;
  name: string;
};

export default async function QrPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: roles } = await supabase.from("user_roles").select("role, tenant_id").eq("user_id", user.id);

  const tenantRole = (roles ?? []).find((r) => r.role === "tenant_owner");

  if (!tenantRole?.tenant_id) {
    redirect("/dashboard/requests");
  }

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id,name,slug")
    .eq("id", tenantRole.tenant_id)
    .single();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Códigos QR</h1>

      <QrGenerator tenant={tenant as TenantRow} />
    </main>
  );
}
