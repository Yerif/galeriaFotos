"use client";

import { useEffect } from "react";

const DURATION_MS = 1900;

// Solo CSS (transform/opacity). Se monta sobre la galería ya hidratada, así no retrasa la carga.
export function IntroTitleCard({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, DURATION_MS);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="intro" onClick={onDone} role="presentation">
      <div className="intro-bar intro-bar-top" />
      <div className="intro-bar intro-bar-bottom" />

      <p
        className="reveal text-xs uppercase tracking-[0.4em] text-foreground/60"
        style={{ animationDelay: "100ms" }}
      >
        Fotos de la fiesta
      </p>
      <h1
        className="title-glow flicker-in mt-2 whitespace-nowrap font-display text-5xl text-blood-bright"
        style={{ animationDelay: "200ms" }}
      >
        Halloween 2026
      </h1>
      <p
        className="reveal mt-3 text-sm uppercase tracking-[0.3em] text-foreground/80"
        style={{ animationDelay: "750ms" }}
      >
        Disponibles por 7 días
      </p>
      <p
        className="reveal absolute bottom-[16vh] text-xs uppercase tracking-widest text-foreground/60"
        style={{ animationDelay: "1000ms" }}
      >
        Toca para saltar
      </p>
    </div>
  );
}
