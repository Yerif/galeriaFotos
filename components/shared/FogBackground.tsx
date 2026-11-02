"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { disableWebGLFog, useWebGLCapability } from "@/lib/webglCapability";

// El chunk de Three.js (~243 KB gzip) solo se descarga en dispositivos que pasan la compuerta
// de capacidad y después de que el navegador quede libre: nunca compite con la carga inicial.
const ThreeScene = dynamic(() => import("@/components/shared/ThreeScene"), { ssr: false });

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

export function FogBackground() {
  const capable = useWebGLCapability();
  const [idle, setIdle] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!capable) return;
    const win = window as IdleWindow;
    if (win.requestIdleCallback) {
      const id = win.requestIdleCallback(() => setIdle(true), { timeout: 1500 });
      return () => win.cancelIdleCallback?.(id);
    }
    const timer = setTimeout(() => setIdle(true), 400);
    return () => clearTimeout(timer);
  }, [capable]);

  const mountWebGL = capable && idle;
  // La niebla CSS está siempre (HTML inicial, respaldo y lo que se ve mientras baja el chunk de WebGL)
  // y solo se apaga cuando WebGL ya dibujó su primer fotograma: nunca queda el fondo sin niebla.
  const glActive = mountWebGL && ready;

  return (
    <div className="fog" aria-hidden="true" data-fog={glActive ? "webgl" : "css"} data-gl={glActive}>
      <div className="fog-css" />
      {mountWebGL && <ThreeScene onSlow={disableWebGLFog} onReadyChange={setReady} />}
    </div>
  );
}
