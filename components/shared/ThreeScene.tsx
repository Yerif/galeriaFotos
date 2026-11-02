"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 40;

function DustMotes() {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    // Posiciones iniciales aleatorias generadas una sola vez (semilla visual, no estado derivado).
    /* eslint-disable react-hooks/purity */
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 6;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    /* eslint-enable react-hooks/purity */
    return arr;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.getElapsedTime();
    pointsRef.current.rotation.y = t * 0.012;
    const attr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const y = attr.getY(i);
      attr.setY(i, y + Math.sin(t * 0.6 + i) * 0.0008);
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#c9a227"
        size={0.035}
        sizeAttenuation
        transparent
        opacity={0.35}
      />
    </points>
  );
}

/** Pausa el loop de render cuando la pestaña no está visible, para no gastar batería/CPU en mobile. */
function usePausedWhenHidden() {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return paused;
}

export default function ThreeScene() {
  const paused = usePausedWhenHidden();

  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, 1.5]}
      frameloop={paused ? "never" : "always"}
      camera={{ position: [0, 0, 5], fov: 60 }}
      gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
    >
      <ambientLight intensity={0.6} />
      <DustMotes />
    </Canvas>
  );
}
