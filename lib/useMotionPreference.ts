"use client";

import { useEffect, useState } from "react";

/** true cuando el usuario pidió menos movimiento o el navegador no soporta WebGL. */
export function useSkipHeavyAnimations() {
  const [skip, setSkip] = useState(true);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let hasWebGL = false;
    try {
      const canvas = document.createElement("canvas");
      hasWebGL = !!(
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
      );
    } catch {
      hasWebGL = false;
    }

    // Leído tras montar: window/matchMedia no existen en SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSkip(prefersReduced || !hasWebGL);
  }, []);

  return skip;
}
