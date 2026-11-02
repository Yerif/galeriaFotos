"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/admin` },
    });

    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    setSent(true);
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-2xl border border-pumpkin/30 bg-panel p-6">
        <h1 className="font-display text-center text-2xl text-pumpkin">
          🎃 Admin
        </h1>
        {sent ? (
          <p className="mt-4 text-center text-sm text-foreground/80">
            Revisa tu correo y toca el link para entrar.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full rounded-lg border border-witch/50 bg-background px-4 py-3 text-base text-foreground outline-none focus:border-pumpkin"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-pumpkin px-4 py-3 font-semibold text-black transition active:scale-95 disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Enviarme el link mágico"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
