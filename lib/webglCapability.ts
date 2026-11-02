"use client";

import { useSyncExternalStore } from "react";

export type CapabilityEnv = {
  reducedMotion: boolean;
  hardwareConcurrency?: number;
  deviceMemory?: number;
  saveData?: boolean;
  effectiveType?: string;
  hasWebGL2: boolean;
  disabledBefore: boolean;
};

const SLOW_NETWORKS = new Set(["slow-2g", "2g", "3g"]);

/** ¿Vale la pena descargar y correr la niebla WebGL en este dispositivo? */
export function evaluateCapability(env: CapabilityEnv): { ok: boolean; reason?: string } {
  if (env.reducedMotion) return { ok: false, reason: "reduced-motion" };
  if (env.disabledBefore) return { ok: false, reason: "too-slow-earlier" };
  if (env.saveData) return { ok: false, reason: "save-data" };
  if (env.effectiveType && SLOW_NETWORKS.has(env.effectiveType)) return { ok: false, reason: "slow-network" };
  if (env.hardwareConcurrency !== undefined && env.hardwareConcurrency < 4) return { ok: false, reason: "few-cores" };
  if (env.deviceMemory !== undefined && env.deviceMemory < 4) return { ok: false, reason: "low-memory" };
  if (!env.hasWebGL2) return { ok: false, reason: "no-webgl2" };
  return { ok: true };
}

const DISABLED_KEY = "fogDisabled";
const listeners = new Set<() => void>();
let cached: boolean | null = null;

function probeWebGL2(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) return false;
    // Se libera el contexto de prueba para no gastar uno de los pocos que permite el navegador.
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

function readEnv(): CapabilityEnv {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  let disabledBefore = false;
  try {
    disabledBefore = sessionStorage.getItem(DISABLED_KEY) === "1";
  } catch {}
  return {
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    hardwareConcurrency: nav.hardwareConcurrency,
    deviceMemory: nav.deviceMemory,
    saveData: nav.connection?.saveData,
    effectiveType: nav.connection?.effectiveType,
    hasWebGL2: probeWebGL2(),
    disabledBefore,
  };
}

function getSnapshot(): boolean {
  if (cached === null) cached = evaluateCapability(readEnv()).ok;
  return cached;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Apaga la niebla WebGL para el resto de la sesión (la guardia de fotogramas detectó un dispositivo lento). */
export function disableWebGLFog() {
  cached = false;
  try {
    sessionStorage.setItem(DISABLED_KEY, "1");
  } catch {}
  listeners.forEach((listener) => listener());
}

// Snapshot del servidor = false: el HTML inicial solo lleva la niebla CSS y no hay desajuste de hidratación.
export function useWebGLCapability(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
