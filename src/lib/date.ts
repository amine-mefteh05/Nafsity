import { TZ } from "./constants";
const pad = (n: number) => String(n).padStart(2, "0");
/** Africa/Tunis has been UTC+1 all year since 2008 (no DST). */
export const TUNIS_OFFSET_MIN = 60;
export function tunisDateStr(d: Date = new Date()): string {
  const t = new Date(d.getTime() + TUNIS_OFFSET_MIN * 60000);
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}
export const dayToDate = (s: string) => new Date(s + "T00:00:00.000Z"); // for @db.Date columns
export function addDays(s: string, n: number): string {
  const d = dayToDate(s); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10);
}
export function tunisMidnightUTC(s: string): Date { return new Date(dayToDate(s).getTime() - TUNIS_OFFSET_MIN * 60000); }
export function tunisWeekday(s: string): number { return dayToDate(s).getUTCDay(); }
export const fmtDateTime = (d: Date) => new Intl.DateTimeFormat("fr-TN", { timeZone: TZ, dateStyle: "medium", timeStyle: "short" }).format(d);
export const fmtDate = (d: Date) => new Intl.DateTimeFormat("fr-TN", { timeZone: TZ, dateStyle: "long" }).format(d);
export const fmtTime = (d: Date) => new Intl.DateTimeFormat("fr-TN", { timeZone: TZ, timeStyle: "short" }).format(d);
export const minToHHMM = (m: number) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
export const hhmmToMin = (s: string) => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };
