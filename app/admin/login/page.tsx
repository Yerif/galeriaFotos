"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      setLoading(false);
      if (res.status === 500) {
        setError("Faltan variables de entorno en el servidor (ADMIN_EMAIL / ADMIN_SESSION_SECRET).");
      } else {
        setError("Ese correo no tiene acceso.");
      }
      return;
    }

    // Recarga completa para que el proxy (middleware) vea la cookie recién seteada.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/admin";
  }

  return (
    <div className="scanlines flex min-h-dvh flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm border border-blood/40 bg-panel p-6 shadow-[0_0_40px_rgba(154,17,21,0.2)]">
        <p className="text-center text-xs uppercase tracking-[0.3em] text-foreground/60">
          Acceso restringido
        </p>
        <h1 className="title-glow mt-1 text-center font-display text-3xl text-blood-bright">
          Admin
        </h1>
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
          <input
            type="email"
            autoFocus
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="w-full border border-ash bg-background px-4 py-3 text-base text-foreground outline-none focus:border-blood"
          />
          {error && <p className="text-sm text-blood-bright">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full border border-blood bg-blood/90 px-4 py-3 font-display tracking-widest text-foreground transition active:scale-95 disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
