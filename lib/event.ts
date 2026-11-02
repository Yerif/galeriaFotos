import type { EventRow } from "@/types/database";

export type EventStatus = {
  event: EventRow;
  isExpired: boolean;
  daysRemaining: number | null;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const MAX_CACHE_SECONDS = 86_400;

/**
 * Cuánto puede vivir una copia en caché sin sobrevivir al plazo de descarga.
 * Devuelve null si el plazo ya venció.
 */
export function cacheSecondsUntilDeadline(
  deadlineAt: string | null,
  now: number = Date.now()
): number | null {
  if (!deadlineAt) return MAX_CACHE_SECONDS;
  const secondsLeft = Math.floor((new Date(deadlineAt).getTime() - now) / 1000);
  if (secondsLeft <= 0) return null;
  return Math.min(MAX_CACHE_SECONDS, secondsLeft);
}

export function getEventStatus(event: EventRow): EventStatus {
  if (!event.deadline_at) {
    return { event, isExpired: false, daysRemaining: null };
  }

  const deadline = new Date(event.deadline_at).getTime();
  const now = Date.now();
  const isExpired = deadline <= now;
  const daysRemaining = isExpired
    ? 0
    : Math.ceil((deadline - now) / MS_PER_DAY);

  return { event, isExpired, daysRemaining };
}
