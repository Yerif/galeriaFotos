// Modo de preview visual, sin Supabase real. Solo para generar capturas de pantalla
// de muestra y medir rendimiento; no se usa en producción (requiere DEMO_MODE=1 explícito).
export const DEMO_MODE = process.env.DEMO_MODE === "1";

const DEMO_COUNT = Math.max(1, Number(process.env.DEMO_COUNT) || 9);
const DEMO_SVG_VARIANTS = 9;

export type DemoPhoto = {
  id: string;
  original_filename: string;
  width: number;
  height: number;
  created_at: string;
  position: number;
};

// Relaciones de aspecto variadas (horizontal, vertical, cuadrada) para probar la grilla justificada.
const DEMO_DIMENSIONS: Array<[number, number]> = [
  [1200, 800],
  [800, 1200],
  [1000, 1000],
  [1200, 900],
  [900, 1200],
  [1600, 900],
  [1000, 1000],
  [1200, 800],
  [800, 1000],
];

const DEMO_BASE_TIME = Date.parse("2026-11-01T12:00:00Z");
export const DEMO_PAGE_SIZE = 24;

export const demoPhotos: DemoPhoto[] = Array.from({ length: DEMO_COUNT }).map((_, i) => {
  const [width, height] = DEMO_DIMENSIONS[i % DEMO_DIMENSIONS.length];
  return {
    id: `demo-${i + 1}`,
    original_filename: `halloween-${i + 1}.jpg`,
    width,
    height,
    created_at: new Date(DEMO_BASE_TIME - i * 3600_000).toISOString(),
    position: i + 1,
  };
});

export function demoPhotoUrl(id: string) {
  const n = Number(id.replace("demo-", "")) || 1;
  return `/demo/halloween-${((n - 1) % DEMO_SVG_VARIANTS) + 1}.svg`;
}

const DEMO_DEADLINE_HOURS = Number(process.env.DEMO_DEADLINE_HOURS) || 120;

export function demoDeadlineIso() {
  return new Date(Date.now() + DEMO_DEADLINE_HOURS * 3_600_000).toISOString();
}

export const demoGuestNames = [
  "Mariana",
  "Carlos",
  "Valeria",
  "Diego",
  "Sofía",
  "Andrés",
];
