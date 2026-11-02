"use client";

import { useEffect, useRef } from "react";
import { isTooSlow } from "@/lib/frameGuard";

// WebGL2 directo (sin Three.js): un solo triángulo a pantalla completa y este shader.
const VERTEX = `#version 300 es
out vec2 vUv;
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

// Niebla de proyector: ruido fractal que deriva despacio + un cono de luz que parpadea.
// Se dibuja a 0.5 de resolución (la niebla es de baja frecuencia: no se nota) y con 3 octavas.
const FRAGMENT = `#version 300 es
precision mediump float;
in vec2 vUv;
uniform float uTime;
uniform float uAspect;
out vec4 outColor;

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

  float alpha = clamp((fog * (0.12 + 0.38 * density) + cone * fog * 0.10 * flick) * edge, 0.0, 0.5);
  // El canvas compone con alfa premultiplicado.
  outColor = vec4(col * alpha, alpha);
}`;

const RENDER_SCALE = 0.5;

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function FogCanvas({
  onSlow,
  onReadyChange,
}: {
  onSlow: () => void;
  onReadyChange: (ready: boolean) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
      premultipliedAlpha: true,
    });
    const vs = gl && compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fs = gl && compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl?.createProgram();
    if (!gl || !vs || !fs || !program) {
      onSlow(); // sin WebGL2 utilizable: se queda la niebla CSS el resto de la sesión
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      onSlow();
      return;
    }
    gl.useProgram(program);
    const uTime = gl.getUniformLocation(program, "uTime");
    const uAspect = gl.getUniformLocation(program, "uAspect");

    const resize = () => {
      const w = Math.max(1, Math.round(canvas.clientWidth * RENDER_SCALE));
      const h = Math.max(1, Math.round(canvas.clientHeight * RENDER_SCALE));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(uAspect, canvas.clientWidth / Math.max(1, canvas.clientHeight));
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const start = performance.now();
    const deltas: number[] = [];
    let decided = false;
    let sentReady = false;
    let raf = 0;
    let last = 0;
    let inView = true;
    let tabVisible = !document.hidden;

    function frame(now: number) {
      raf = 0;
      if (!gl) return;

      gl.uniform1f(uTime, (now - start) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (!sentReady) {
        sentReady = true;
        onReadyChange(true);
      }

      // Guardia: si los primeros fotogramas son lentos, se apaga la niebla y vuelve la versión CSS.
      if (!decided && last) {
        deltas.push(now - last);
        const verdict = isTooSlow(deltas);
        if (verdict !== null) {
          decided = true;
          if (verdict) {
            onSlow();
            return;
          }
        }
      }
      last = now;
      raf = requestAnimationFrame(frame);
    }

    // Sin fotogramas cuando la niebla no se ve (fuera de pantalla o pestaña oculta): ahorra batería.
    function update() {
      const running = inView && tabVisible;
      wrap!.dataset.running = String(running);
      if (running && !raf) {
        last = 0; // tras una pausa, el primer delta no cuenta
        raf = requestAnimationFrame(frame);
      } else if (!running && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }

    const intersection = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    });
    intersection.observe(wrap);
    const onVisibility = () => {
      tabVisible = !document.hidden;
      update();
    };
    document.addEventListener("visibilitychange", onVisibility);
    const onContextLost = (e: Event) => {
      e.preventDefault();
      onSlow();
    };
    canvas.addEventListener("webglcontextlost", onContextLost);
    update();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      intersection.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      onReadyChange(false);
    };
  }, [onSlow, onReadyChange]);

  return (
    <div ref={wrapRef} className="fog-canvas" data-running="true">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
