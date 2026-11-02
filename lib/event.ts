import type { EventRow } from "@/types/database";

export type EventStatus = {
  event: EventRow;
  isExpired: boolean;
  daysRemaining: number | null;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

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
