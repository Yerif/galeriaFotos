"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { ShaderMaterial } from "three";
import { isTooSlow } from "@/lib/frameGuard";

// El vértice ignora la cámara: un solo quad que cubre todo el canvas.
const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// Niebla de proyector: ruido fractal que deriva despacio + un cono de luz que parpadea.
// Se dibuja a 0.5 de resolución (la niebla es de baja frecuencia: no se nota) y con 3 octavas.
const FRAGMENT = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uAspect;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 3; i++) {
      v += a * noise(p);
      p *= 2.02;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 p = vec2(vUv.x * uAspect, vUv.y);
    float t = uTime * 0.035;

    float fog = fbm(p * 2.2 + vec2(t, -t * 0.6)) * 0.65 + fbm(p * 4.3 - vec2(t * 1.4, 0.0)) * 0.35;

    // vUv.y = 0 es la parte baja: la niebla es más densa abajo y se disuelve en los bordes del canvas.
    float density = smoothstep(1.0, 0.1, vUv.y);
    float edge = smoothstep(0.0, 0.18, vUv.y) * smoothstep(1.0, 0.7, vUv.y);

    float flick = 0.85 + 0.15 * sin(uTime * 1.7) * sin(uTime * 0.71) + 0.05 * hash(vec2(floor(uTime * 8.0), 3.0));
    float cone = smoothstep(0.5, 0.0, abs(vUv.x - 0.5) * (1.0 + (1.0 - vUv.y) * 1.2)) * smoothstep(0.2, 1.0, vUv.y);

    vec3 blood = vec3(0.60, 0.07, 0.08);
    vec3 bone = vec3(0.91, 0.88, 0.82);
    vec3 col = mix(blood, bone, cone * 0.35 * flick);

    float alpha = (fog * (0.12 + 0.38 * density) + cone * fog * 0.10 * flick) * edge;
    gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.5));
  }
`;

const INITIAL_UNIFORMS = { uTime: { value: 0 }, uAspect: { value: 1 } };

function FogPlane({ onSlow, onFirstFrame }: { onSlow: () => void; onFirstFrame: () => void }) {
  const material = useRef<ShaderMaterial>(null);
  const samples = useRef<number[]>([]);
  const decided = useRef(false);
  const firstFrameSent = useRef(false);

  useFrame((state, delta) => {
    if (!firstFrameSent.current) {
      firstFrameSent.current = true;
      onFirstFrame();
    }
    const m = material.current;
    if (m) {
      m.uniforms.uTime.value = state.clock.elapsedTime;
      m.uniforms.uAspect.value = state.size.width / state.size.height;
    }

    // Guardia: si los primeros fotogramas son lentos, se apaga la niebla y se vuelve a la versión CSS.
    if (!decided.current) {
      samples.current.push(delta * 1000);
      const verdict = isTooSlow(samples.current);
      if (verdict !== null) {
        decided.current = true;
        samples.current = [];
        if (verdict) onSlow();
      }
    }
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
        uniforms={INITIAL_UNIFORMS}
        transparent
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function ThreeScene({
  onSlow,
  onReadyChange,
}: {
  onSlow: () => void;
  onReadyChange: (ready: boolean) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);

  // Sin fotogramas cuando la niebla no se ve (fuera de pantalla o pestaña oculta): ahorra batería.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(el);
    const onVisibility = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // Al desmontarse (p. ej. la guardia la apagó) se avisa para que vuelva la niebla CSS.
  useEffect(() => () => onReadyChange(false), [onReadyChange]);

  const running = inView && tabVisible;

  return (
    <div ref={wrapRef} className="fog-canvas" data-running={running}>
      <Canvas
        dpr={0.5}
        frameloop={running ? "always" : "never"}
        orthographic
        camera={{ position: [0, 0, 1] }}
        gl={{ antialias: false, alpha: true, powerPreference: "low-power", depth: false, stencil: false }}
        style={{ pointerEvents: "none" }}
      >
        <FogPlane onSlow={onSlow} onFirstFrame={() => onReadyChange(true)} />
      </Canvas>
    </div>
  );
}
