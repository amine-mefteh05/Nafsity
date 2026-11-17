"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { bookAppointment, cancelAppointment } from "@/lib/booking";
import { notify } from "@/lib/notify";
import { fmtDateTime } from "@/lib/date";

export async function bookAction(psychologistId: string, startIso: string) {
  const u = await requireRole("USER");
  const r = await bookAppointment(u.id, psychologistId, startIso);
  revalidatePath("/appointments"); revalidatePath(`/psychologists/${psychologistId}`);
  return r;
}
export async function cancelMine(fd: FormData) {
  const u = await requireRole("USER");
  const a = await prisma.appointment.findFirst({ where: { id: String(fd.get("id")), userId: u.id } }); // ownership check
  if (a) await cancelAppointment(a.id, "user");
  revalidatePath("/appointments");
}
export async function requestReschedule(fd: FormData) {
  const u = await requireRole("USER");
  const a = await prisma.appointment.findFirst({ where: { id: String(fd.get("id")), userId: u.id, status: { in: ["PENDING", "CONFIRMED"] } }, include: { psychologist: true } });
  if (a && !a.rescheduleRequested) {
    await prisma.appointment.update({ where: { id: a.id }, data: { rescheduleRequested: true } });
    await notify(a.psychologist.userId, "appointment", "Demande de report", `Un patient demande à reporter le rendez-vous du ${fmtDateTime(a.startsAt)}.`);
  }
  revalidatePath("/appointments");
}
