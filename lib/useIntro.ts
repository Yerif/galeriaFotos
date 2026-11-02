"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "introSeen";
const listeners = new Set<() => void>();
let finishedInMemory = false;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// La intro se reproduce una vez por sesión y nunca con "reducir movimiento".
function shouldPlay() {
  if (finishedInMemory) return false;
  try {
    if (sessionStorage.getItem(KEY)) return false;
  } catch {
    // sessionStorage bloqueado: se reproduce una vez por carga de página (finishedInMemory).
  }
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// El snapshot del servidor es `false`: no hay intro en el HTML inicial y no hay desajuste de hidratación.
export function useIntro() {
  const playing = useSyncExternalStore(subscribe, shouldPlay, () => false);

  const finish = useCallback(() => {
    finishedInMemory = true;
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {}
    listeners.forEach((listener) => listener());
  }, []);

  return { playing, finish };
}
