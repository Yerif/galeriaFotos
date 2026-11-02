const WARMUP_FRAMES = 5;
const SAMPLE_FRAMES = 90;
const MAX_MEDIAN_MS = 24;
// Un salto grande es una pausa (pestaña oculta, scroll fuera de pantalla), no lentitud.
const IGNORE_ABOVE_MS = 250;

/**
 * Decide si el dispositivo es demasiado lento para la niebla a partir de los tiempos de fotograma (ms).
 * null = todavía no hay suficientes muestras. Mediana > 24 ms (< ~41 fps, o el límite de 30 fps del
 * modo de bajo consumo de iOS) = demasiado lento.
 */
export function isTooSlow(deltasMs: number[]): boolean | null {
  const usable = deltasMs.filter((d) => d <= IGNORE_ABOVE_MS).slice(WARMUP_FRAMES);
  if (usable.length < SAMPLE_FRAMES) return null;

  const sample = usable.slice(0, SAMPLE_FRAMES).sort((a, b) => a - b);
  const median = sample[Math.floor(sample.length / 2)];
  return median > MAX_MEDIAN_MS;
}
