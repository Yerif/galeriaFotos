// Modo de preview visual, sin Supabase real. Solo para generar capturas de pantalla
// de muestra; no se usa en producción (requiere DEMO_MODE=1 explícito).
export const DEMO_MODE = process.env.DEMO_MODE === "1";

export type DemoPhoto = {
  id: string;
  original_filename: string;
  width: number;
  height: number;
  created_at: string;
};

export const demoPhotos: DemoPhoto[] = Array.from({ length: 9 }).map((_, i) => ({
  id: `demo-${i + 1}`,
  original_filename: `halloween-${i + 1}.jpg`,
  width: 1200,
  height: 1200,
  created_at: new Date(Date.now() - i * 3600_000).toISOString(),
}));

export function demoPhotoUrl(id: string) {
  const n = Number(id.replace("demo-", "")) || 1;
  return `/demo/halloween-${n}.svg`;
}

export function demoDeadlineIso() {
  return new Date(Date.now() + 5 * 86_400_000).toISOString();
}

export const demoGuestNames = [
  "Mariana",
  "Carlos",
  "Valeria",
  "Diego",
  "Sofía",
  "Andrés",
];
