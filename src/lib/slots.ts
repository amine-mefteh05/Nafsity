import { tunisMidnightUTC } from "./date";
import { MIN_BOOKING_LEAD_HOURS } from "./constants";

export type Rule = { startMinute: number; endMinute: number; slotMinutes: number; breakStartMinute: number | null; breakEndMinute: number | null };
export type Busy = { startsAt: Date; endsAt: Date };

/** Pure function: candidate slots for one day, minus breaks, busy periods and past/too-soon times. */
export function generateSlots(dateStr: string, rule: Rule | null, busy: Busy[], now = new Date()): Date[] {
  if (!rule) return [];
  const base = tunisMidnightUTC(dateStr).getTime();
  const minStart = now.getTime() + MIN_BOOKING_LEAD_HOURS * 3600000;
  const out: Date[] = [];
  for (let m = rule.startMinute; m + rule.slotMinutes <= rule.endMinute; m += rule.slotMinutes) {
    const e = m + rule.slotMinutes;
    if (rule.breakStartMinute != null && rule.breakEndMinute != null && m < rule.breakEndMinute && e > rule.breakStartMinute) continue;
    const s = new Date(base + m * 60000), en = new Date(base + e * 60000);
    if (s.getTime() < minStart) continue;
    if (busy.some((b) => s < b.endsAt && en > b.startsAt)) continue;
    out.push(s);
  }
  return out;
}
