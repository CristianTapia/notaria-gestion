import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, LogOut, ShieldCheck } from "lucide-react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import LogoutButton from "@/app/dashboard/LogoutButton";

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
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <aside className="flex w-72 flex-col bg-[var(--color-navy)] text-white">
        <div className="border-b border-white/10 p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--color-gold)]/15 text-[var(--color-gold)]">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-lg font-medium">Lab3c Admin</h1>
              <p className="text-xs text-white/60">Administración global</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <Building2 className="h-4 w-4" />
            <span>Notarías</span>
          </Link>
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-4 rounded-xl bg-white/5 p-3">
            <p className="truncate text-sm">{user.email}</p>
            <p className="mt-1 text-xs text-white/50">Super administrador</p>
          </div>

          <div className="flex items-center gap-2 text-white/70">
            <LogOut className="h-4 w-4" />
            <LogoutButton />
          </div>
        </div>
      </aside>

      <main className="flex-1">
        <div className="mx-auto max-w-7xl p-8">{children}</div>
      </main>
    </div>
  );
}
