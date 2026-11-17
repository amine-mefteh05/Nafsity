"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { cancelAppointment } from "@/lib/booking";
import { notify } from "@/lib/notify";
import { hhmmToMin, tunisMidnightUTC, addDays, fmtDateTime } from "@/lib/date";

async function myPsy() {
  const u = await requireRole("PSYCHOLOGIST");
  const p = await prisma.psychologist.findUnique({ where: { userId: u.id } });
  if (!p) throw new Error("Profil psychologue introuvable");
  return { u, p };
}
async function mine(id: string, psyId: string) { return prisma.appointment.findFirst({ where: { id, psychologistId: psyId } }); } // ownership

export async function proConfirm(fd: FormData) {
  const { p } = await myPsy(); const a = await mine(String(fd.get("id")), p.id);
  if (a && a.status === "PENDING") { await prisma.appointment.update({ where: { id: a.id }, data: { status: "CONFIRMED" } }); await notify(a.userId, "appointment", "Rendez-vous confirmé", `Votre rendez-vous du ${fmtDateTime(a.startsAt)} est confirmé.`); }
  revalidatePath("/pro/appointments");
}
export async function proReject(fd: FormData) {
  const { p } = await myPsy(); const a = await mine(String(fd.get("id")), p.id);
  if (a) await cancelAppointment(a.id, "pro", "Refusé par le psychologue");
  revalidatePath("/pro/appointments");
}
export async function proComplete(fd: FormData) {
  const { p } = await myPsy(); const a = await mine(String(fd.get("id")), p.id);
  if (a && a.status === "CONFIRMED" && a.endsAt < new Date()) await prisma.appointment.update({ where: { id: a.id }, data: { status: "COMPLETED", consultationNotes: String(fd.get("notes") || "").slice(0, 5000) || null } });
  revalidatePath("/pro/appointments");
}
export async function proRequestReschedule(fd: FormData) {
  const { p } = await myPsy(); const a = await mine(String(fd.get("id")), p.id);
  if (a && ["PENDING", "CONFIRMED"].includes(a.status)) await notify(a.userId, "appointment", "Report demandé", `Le psychologue souhaite reporter le rendez-vous du ${fmtDateTime(a.startsAt)}. Vous pouvez l'annuler (séance restituée) et reprendre un créneau.`);
  revalidatePath("/pro/appointments");
}
export async function saveAvailability(fd: FormData) {
  const { p } = await myPsy();
  for (let wd = 0; wd < 7; wd++) {
    const where = { psychologistId_weekday: { psychologistId: p.id, weekday: wd } };
    if (fd.get(`on_${wd}`) !== "on") { await prisma.availability.deleteMany({ where: { psychologistId: p.id, weekday: wd } }); continue; }
    const s = hhmmToMin(String(fd.get(`start_${wd}`) || "09:00")), e = hhmmToMin(String(fd.get(`end_${wd}`) || "17:00"));
    const slot = Math.min(180, Math.max(15, Number(fd.get("slot")) || 45));
    const bs = fd.get(`bs_${wd}`) ? hhmmToMin(String(fd.get(`bs_${wd}`))) : null, be = fd.get(`be_${wd}`) ? hhmmToMin(String(fd.get(`be_${wd}`))) : null;
    if (e <= s) continue;
    const data = { startMinute: s, endMinute: e, slotMinutes: slot, breakStartMinute: bs != null && be != null && be > bs ? bs : null, breakEndMinute: bs != null && be != null && be > bs ? be : null };
    await prisma.availability.upsert({ where, update: data, create: { ...data, psychologistId: p.id, weekday: wd } });
  }
  revalidatePath("/pro/availability");
}
export async function blockDates(fd: FormData) {
  const { p } = await myPsy(); const from = String(fd.get("from")), to = String(fd.get("to") || fd.get("from"));
  if (!/^\d{4}-\d\d-\d\d$/.test(from) || !/^\d{4}-\d\d-\d\d$/.test(to) || to < from) return;
  await prisma.availabilitySlot.create({ data: { psychologistId: p.id, startsAt: tunisMidnightUTC(from), endsAt: tunisMidnightUTC(addDays(to, 1)), reason: String(fd.get("reason") || "").slice(0, 100) || null } });
  revalidatePath("/pro/availability");
}
export async function unblock(fd: FormData) {
  const { p } = await myPsy(); await prisma.availabilitySlot.deleteMany({ where: { id: String(fd.get("id")), psychologistId: p.id } }); revalidatePath("/pro/availability");
}
export async function proSaveProfile(fd: FormData) {
  const { p } = await myPsy();
  await prisma.psychologist.update({ where: { id: p.id }, data: { bio: String(fd.get("bio") || "").slice(0, 2000), experienceYears: Math.max(0, Number(fd.get("exp")) || 0) } }); // verified status is admin-only
  revalidatePath("/pro/profile");
}
