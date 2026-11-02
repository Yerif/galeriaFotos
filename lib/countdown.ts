export type CountdownState = "days" | "clock" | "final" | "done";

const DAY_SECONDS = 86_400;
const HOUR_SECONDS = 3_600;

const pad = (n: number) => String(n).padStart(2, "0");

/** Texto y estado del contador. Más de 24 h: días (redondeados hacia arriba); menos: HH:MM:SS; última hora: "final". */
export function describeCountdown(msLeft: number): { text: string; state: CountdownState } {
  if (msLeft <= 0) return { text: "00:00:00", state: "done" };

  const totalSeconds = Math.floor(msLeft / 1000);

  if (totalSeconds >= DAY_SECONDS) {
    const days = Math.ceil(totalSeconds / DAY_SECONDS);
    return { text: `${days} ${days === 1 ? "DÍA" : "DÍAS"}`, state: "days" };
  }

  const h = Math.floor(totalSeconds / HOUR_SECONDS);
  const m = Math.floor((totalSeconds % HOUR_SECONDS) / 60);
  const s = totalSeconds % 60;
  return {
    text: `${pad(h)}:${pad(m)}:${pad(s)}`,
    state: totalSeconds < HOUR_SECONDS ? "final" : "clock",
  };
}

/** Cada cuánto conviene refrescar: con días por delante basta cada 30 s (ahorra batería). */
export function nextTickDelayMs(state: CountdownState): number {
  return state === "days" ? 30_000 : 1_000;
}
