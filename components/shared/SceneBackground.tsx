"use client";

import dynamic from "next/dynamic";
import { useSkipHeavyAnimations } from "@/lib/useMotionPreference";
import { HalloweenDecor } from "@/components/shared/HalloweenDecor";

const ThreeScene = dynamic(() => import("@/components/shared/ThreeScene"), {
  ssr: false,
});

/** Fondo decorativo: Three.js si el dispositivo lo soporta y no pidió reduced-motion, CSS si no. */
export function SceneBackground() {
  const skipHeavy = useSkipHeavyAnimations();

  return (
    <div className="absolute inset-0 overflow-hidden">
      {skipHeavy ? <HalloweenDecor /> : <ThreeScene />}
    </div>
  );
}
