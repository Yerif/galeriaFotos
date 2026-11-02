"use client";

import { useState } from "react";

export function NamePrompt({ onSubmit }: { onSubmit: (name: string) => void }) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("Escribe tu nombre para continuar.");
      return;
    }
    onSubmit(trimmed);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <form
        onSubmit={handleSubmit}
        className="scanlines w-full max-w-sm border border-blood/40 bg-panel p-6 shadow-[0_0_40px_rgba(154,17,21,0.25)]"
      >
        <p className="text-center text-[11px] uppercase tracking-[0.3em] text-foreground/40">
          Una producción de
        </p>
        <h1 className="title-glow mt-1 text-center font-display text-4xl text-blood">
          La Galería
        </h1>
        <p className="mt-3 text-center text-sm leading-relaxed text-foreground/70">
          Identifícate para entrar. Sabremos qué fotos te llevaste.
        </p>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
          className="mt-5 w-full border border-ash bg-background px-4 py-3 text-base text-foreground outline-none focus:border-blood"
          maxLength={60}
        />
        {error && <p className="mt-2 text-sm text-blood">{error}</p>}
        <button
          type="submit"
          className="mt-4 w-full border border-blood bg-blood/90 px-4 py-3 font-display text-lg tracking-widest text-foreground transition active:scale-95"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
