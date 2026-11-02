"use client";

import { useEffect, useRef } from "react";
import { Countdown } from "@/components/guest/Countdown";
import { FogBackground } from "@/components/shared/FogBackground";

export function GalleryHeader({ deadlineAt }: { deadlineAt: string | null }) {
  const heroRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // La barra fija aparece cuando la cabecera grande sale de pantalla (atributo en el DOM, sin re-render).
  useEffect(() => {
    const hero = heroRef.current;
    const bar = barRef.current;
    if (!hero || !bar) return;
    const observer = new IntersectionObserver(([entry]) => {
      bar.dataset.stuck = entry.isIntersecting ? "false" : "true";
    });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={barRef} data-stuck="false" className="sticky-bar" aria-hidden="true">
        <span className="title-glow font-display text-xl tracking-widest text-blood-bright">Halloween 2026</span>
        <Countdown deadlineAt={deadlineAt} variant="compact" />
      </div>

      <header ref={heroRef} className="relative mb-6 text-center">
        <FogBackground />
        <div className="relative z-10 flex flex-col items-center gap-2">
          <p className="text-xs uppercase tracking-[0.3em] text-foreground/60">Fotos de la fiesta</p>
          <h1 className="title-glow whitespace-nowrap font-display text-4xl text-blood-bright min-[380px]:text-5xl">Halloween 2026</h1>
          <Countdown deadlineAt={deadlineAt} variant="hero" />
        </div>
      </header>
    </>
  );
}
