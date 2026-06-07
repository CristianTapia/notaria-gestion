import { Building2, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";

import LogoutButton from "@/app/dashboard/LogoutButton";
import AppShell from "@/components/layouts/AppShell";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
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

  return (
    <AppShell
      title="Lab3c Admin"
      subtitle="Administración global"
      email={user.email}
      navItems={[
        {
          href: "/admin",
          label: "Notarías",
          icon: <Building2 className="h-4 w-4" />,
        },
      ]}
      footer={
        <div className="flex items-center gap-2 text-white/70">
          <ShieldCheck className="h-4 w-4" />
          <LogoutButton />
        </div>
      }
    >
      {children}
    </AppShell>
  );
}
