"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setBusy(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/dashboard");
  };

  const resetPassword = async () => {
    if (!email) {
      alert("Escribe tu correo primero");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Te enviamos un correo para recuperar tu contraseña");
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 border rounded-xl p-6">
        <h1 className="text-2xl font-bold">Acceso notaría</h1>

        <input
          type="email"
          required
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-md px-3 py-2"
        />

        <input
          type="password"
          required
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-md px-3 py-2"
        />

        <button disabled={busy} className="w-full bg-black text-white rounded-md py-2">
          {busy ? "Entrando..." : "Entrar"}
        </button>
        <button type="button" onClick={resetPassword} className="w-full text-sm text-gray-500 hover:text-black">
          ¿Olvidaste tu contraseña?
        </button>
      </form>
    </main>
  );
}
