"use client";

import { useEffect, useRef } from "react";
import { describeCountdown, nextTickDelayMs } from "@/lib/countdown";

const RELOAD_KEY = "countdownReloadAt";
const RELOAD_COOLDOWN_MS = 60_000;

// El texto y el estado se escriben directo en el DOM (sin estado de React): evita re-renderizar cada segundo.
export function Countdown({
  deadlineAt,
  variant = "hero",
}: {
  deadlineAt: string | null;
  variant?: "hero" | "compact";
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!deadlineAt) return;
    const deadline = new Date(deadlineAt).getTime();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;

    function tick() {
      clearTimeout(timer);
      if (stopped) return;
      // En pestaña oculta no se pinta nada; al volver, visibilitychange dispara un tick inmediato.
      if (document.hidden) return;

      const { text, state } = describeCountdown(deadline - Date.now());
      if (textRef.current && textRef.current.textContent !== text) textRef.current.textContent = text;
      if (rootRef.current && rootRef.current.dataset.state !== state) rootRef.current.dataset.state = state;

      if (state === "done") {
        stopped = true;
        reloadOnce();
        return;
      }
      timer = setTimeout(tick, nextTickDelayMs(state));
    }

    tick();
    document.addEventListener("visibilitychange", tick);
    return () => {
      stopped = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [deadlineAt]);

  if (!deadlineAt) {
    return (
      <p className="text-xs uppercase tracking-widest text-foreground/60">Sin fecha límite todavía</p>
    );
  }

  return (
    <div
      ref={rootRef}
      className={`cd cd-${variant}`}
      data-state="days"
      data-deadline={deadlineAt}
      role="timer"
      aria-label="Tiempo restante para descargar las fotos"
    >
      <span ref={textRef} className="cd-text font-display" />
      {variant === "hero" && (
        <>
          <span className="cd-label cd-label-days">para descargar tus fotos</span>
          <span className="cd-label cd-label-urgent">antes de que desaparezcan</span>
        </>
      )}
    </div>
  );
}

// Al llegar a cero se recarga una vez para que el servidor muestre la pantalla de plazo vencido.
// El límite evita un bucle si el reloj del teléfono va adelantado respecto al servidor.
function reloadOnce() {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
    if (Date.now() - last < RELOAD_COOLDOWN_MS) return;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    return;
  }
  window.location.reload();
}
