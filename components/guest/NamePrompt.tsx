"use client";

import { useState } from "react";

// Se muestra solo cuando alguien toca descargar y aún no dio su nombre.
export function NamePrompt({
  onSubmit,
  onCancel,
}: {
  onSubmit: (name: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("Escribe tu nombre para guardar la foto.");
      return;
    }
    onSubmit(trimmed);
  }

  return (
    // z-index por encima del lightbox (9999): el nombre también se pide al descargar desde la foto abierta.
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 p-4">
      <form
        onSubmit={handleSubmit}
        className="scanlines w-full max-w-sm border border-blood/40 bg-panel p-6 shadow-[0_0_40px_rgba(154,17,21,0.25)]"
      >
        <p className="text-center text-xs uppercase tracking-[0.3em] text-foreground/60">
          Antes de descargar
        </p>
        <h1 className="title-glow mt-1 text-center font-display text-4xl text-blood-bright">
          ¿Quién eres?
        </h1>
        <p className="mt-3 text-center text-sm leading-relaxed text-foreground/70">
          Escribe tu nombre y listo. Solo te lo pedimos esta vez.
        </p>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
          autoComplete="given-name"
          className="mt-5 w-full border border-ash bg-background px-4 py-3 text-base text-foreground outline-none focus:border-blood"
          maxLength={60}
        />
        {error && <p className="mt-2 text-sm text-blood-bright">{error}</p>}
        <button
          type="submit"
          className="mt-4 w-full border border-blood bg-blood/90 px-4 py-3 font-display text-lg tracking-widest text-foreground transition active:scale-95"
        >
          Descargar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="mt-2 w-full px-4 py-2 text-xs uppercase tracking-widest text-foreground/60"
        >
          Ahora no
        </button>
      </form>
    </div>
  );
}
