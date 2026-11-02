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
    <div className="scanlines flex min-h-dvh flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm border border-blood/40 bg-panel p-6 shadow-[0_0_40px_rgba(154,17,21,0.2)]">
        <p className="text-center text-[11px] uppercase tracking-[0.3em] text-foreground/40">
          Acceso restringido
        </p>
        <h1 className="title-glow mt-1 text-center font-display text-3xl text-blood">
          Admin
        </h1>
        {sent ? (
          <p className="mt-4 text-center text-sm text-foreground/80">
            Revisa tu correo y toca el link para entrar.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full border border-ash bg-background px-4 py-3 text-base text-foreground outline-none focus:border-blood"
            />
            {error && <p className="text-sm text-blood">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full border border-blood bg-blood/90 px-4 py-3 font-display tracking-widest text-foreground transition active:scale-95 disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Enviarme el link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
