import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { inviteTenantMember, removeTenantMember } from "./actions";

type RoleRow = {
  id: string;
  user_id: string;
  role: string;
  tenant_id: string;
};

export default async function UsersPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: ownerRole } = await supabase
    .from("user_roles")
    .select("tenant_id")
    .eq("user_id", user.id)
    .eq("role", "tenant_owner")
    .maybeSingle();

  if (!ownerRole?.tenant_id) {
    redirect("/dashboard/requests");
  }

  const tenantId = ownerRole.tenant_id;

  const { data: roles, error: rolesError } = await supabaseAdmin
    .from("user_roles")
    .select("id,user_id,role,tenant_id")
    .eq("tenant_id", tenantId)
    .order("role");

  if (rolesError) {
    throw new Error(rolesError.message);
  }

  const typedRoles = (roles ?? []) as RoleRow[];

  const { data: usersRes, error: usersError } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (usersError) {
    throw new Error(usersError.message);
  }

  const users = usersRes.users;

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold">Usuarios</h1>

      <form action={inviteTenantMember} className="mt-6 flex gap-2">
        <input
          name="email"
          type="email"
          required
          placeholder="correo@ejemplo.com"
          className="flex-1 rounded-md border px-3 py-2"
        />

        <button className="rounded-md bg-black px-4 py-2 text-white">Invitar funcionario</button>
      </form>

      <div className="mt-8 space-y-3">
        {typedRoles.map((role) => {
          const roleUser = users.find((u) => u.id === role.user_id);

          return (
            <div key={role.id} className="flex items-center justify-between rounded-xl border p-4">
              <div>
                <p className="font-medium">{roleUser?.email ?? role.user_id}</p>
                <p className="text-sm text-gray-500">{role.role}</p>
              </div>

              {role.role === "tenant_member" && (
                <form action={removeTenantMember}>
                  <input type="hidden" name="userId" value={role.user_id} />
                  <button className="rounded-md border px-3 py-2 text-sm text-red-600">Quitar</button>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
