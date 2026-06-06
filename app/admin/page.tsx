import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import CreateTenantForm from "./CreateTenantForm";
import TenantAdminCard from "./TenantAdminCard";

type TenantRow = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  created_at: string;
};

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: role } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "super_admin")
    .maybeSingle();

  if (!role) redirect("/dashboard");

  const { data: tenants, error } = await supabaseAdmin
    .from("tenants")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const typedTenants = (tenants ?? []) as TenantRow[];
  const activeCount = typedTenants.filter((tenant) => tenant.active).length;

  return (
    <div>
      <header className="mb-8">
        <p className="text-sm font-medium text-[var(--color-gold)]">Administración global</p>

        <div className="mt-2 flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-normal tracking-[-0.03em]">Notarías</h1>
            <p className="mt-2 text-sm text-[var(--color-muted)]">Crea, administra y asigna dueños a cada notaría.</p>
          </div>

          <div className="hidden rounded-2xl border border-[var(--color-border)] bg-white/80 px-5 py-3 text-right shadow-sm md:block">
            <p className="text-2xl font-medium">{typedTenants.length}</p>
            <p className="text-xs text-[var(--color-muted)]">{activeCount} activas</p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div>
          <CreateTenantForm />
        </div>

        <section className="space-y-3">
          {typedTenants.length === 0 ? (
            <div className="rounded-2xl border border-[var(--color-border)] bg-white/80 p-8 text-center">
              <p className="text-sm text-[var(--color-muted)]">Aún no hay notarías creadas.</p>
            </div>
          ) : (
            typedTenants.map((tenant) => <TenantAdminCard key={tenant.id} tenant={tenant} />)
          )}
        </section>
      </div>
    </div>
  );
}
