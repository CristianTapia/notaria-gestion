"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

async function requireTenantOwner() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No autenticado");
  }

  const { data: role } = await supabase
    .from("user_roles")
    .select("tenant_id")
    .eq("user_id", user.id)
    .eq("role", "tenant_owner")
    .maybeSingle();

  if (!role?.tenant_id) {
    throw new Error("Solo el dueño de la notaría puede gestionar usuarios");
  }

  return role.tenant_id as string;
}

export async function inviteTenantMember(formData: FormData) {
  const tenantId = await requireTenantOwner();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!email) {
    throw new Error("Correo requerido");
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data: invited, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/auth/update-password`,
  });

  if (inviteError) {
    throw new Error(inviteError.message);
  }

  const userId = invited.user?.id;

  if (!userId) {
    throw new Error("No se pudo crear/invitar usuario");
  }

  const { error: roleError } = await supabaseAdmin.from("user_roles").insert({
    user_id: userId,
    tenant_id: tenantId,
    role: "tenant_member",
  });

  if (roleError && !roleError.message.toLowerCase().includes("duplicate")) {
    throw new Error(roleError.message);
  }

  revalidatePath("/dashboard/users");
}

export async function removeTenantMember(formData: FormData) {
  const tenantId = await requireTenantOwner();
  const userId = String(formData.get("userId") ?? "");

  if (!userId) {
    throw new Error("Usuario requerido");
  }

  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .delete()
    .eq("user_id", userId)
    .eq("tenant_id", tenantId)
    .eq("role", "tenant_member")
    .select("id");

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error("No se eliminó ningún rol de funcionario.");
  }

  revalidatePath("/dashboard/users");
}
