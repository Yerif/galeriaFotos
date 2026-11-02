"use client";

import { useState } from "react";

export function NamePrompt({ onSubmit }: { onSubmit: (name: string) => void }) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("Escribe tu nombre para poder entrar 🎃");
      return;
    }
    onSubmit(trimmed);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-pumpkin/30 bg-panel p-6 shadow-xl"
      >
        <p className="text-center text-3xl">🎃👻🦇</p>
        <h1 className="mt-2 text-center font-display text-2xl text-pumpkin">
          Galería de Halloween
        </h1>
        <p className="mt-2 text-center text-sm text-foreground/70">
          Dinos tu nombre para que sepamos quién se lleva cada foto.
        </p>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
          className="mt-4 w-full rounded-lg border border-witch/50 bg-background px-4 py-3 text-base text-foreground outline-none focus:border-pumpkin"
          maxLength={60}
        />
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          className="mt-4 w-full rounded-lg bg-pumpkin px-4 py-3 font-semibold text-black transition active:scale-95"
        >
          Entrar a la galería
        </button>
      </form>
    </div>
  );
}
