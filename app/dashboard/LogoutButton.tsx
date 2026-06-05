"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={logout}
      className="mt-3 w-full rounded-md border px-3 py-2 text-left text-sm hover:bg-gray-100"
    >
      Salir
    </button>
  );
}
