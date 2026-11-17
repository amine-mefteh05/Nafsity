"use server";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { requireRole, hashPassword } from "@/lib/auth";
import { cancelAppointment } from "@/lib/booking";

async function admin() { return requireRole("ADMIN"); }
async function audit(adminId: string, action: string, target?: string, detail?: string) { await prisma.adminAuditLog.create({ data: { adminId, action, target, detail } }); }

export async function toggleUserStatus(fd: FormData) {
  const a = await admin(); const id = String(fd.get("id"));
  const u = await prisma.user.findUnique({ where: { id } });
  if (!u || u.id === a.id || u.role === "ADMIN") return;
  const status = u.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
  await prisma.user.update({ where: { id }, data: { status } }); await audit(a.id, "user.status", id, status); revalidatePath("/admin/users");
}
export async function togglePsy(fd: FormData) {
  const a = await admin(); const id = String(fd.get("id")), field = String(fd.get("field"));
  const p = await prisma.psychologist.findUnique({ where: { id } }); if (!p) return;
  if (field === "verified") { await prisma.psychologist.update({ where: { id }, data: { verified: !p.verified, verifiedAt: p.verified ? null : new Date() } }); await prisma.psychologistQualification.updateMany({ where: { psychologistId: id }, data: { verified: !p.verified } }); }
  else if (field === "active") await prisma.psychologist.update({ where: { id }, data: { active: !p.active } });
  await audit(a.id, `psychologist.${field}`, id); revalidatePath("/admin/psychologists");
}
export async function createPsychologist(fd: FormData) {
  const a = await admin();
  const email = String(fd.get("email")).trim().toLowerCase(); if (!/^\S+@\S+\.\S+$/.test(email) || await prisma.user.findUnique({ where: { email } })) return;
  const pw = randomBytes(6).toString("hex") + "A1"; // temporary password; printed to server console (dev) — no email provider yet
  console.log(`[DEV] Mot de passe temporaire pour ${email}: ${pw}`);
  await prisma.user.create({ data: { email, passwordHash: await hashPassword(pw), firstName: String(fd.get("firstName")), lastName: String(fd.get("lastName")), role: "PSYCHOLOGIST", language: "fr",
    psychologist: { create: { bio: String(fd.get("bio") || "À compléter."), governorate: String(fd.get("governorate") || "Tunis"), languages: ["Français", "Arabe"], verified: false } } } });
  await audit(a.id, "psychologist.create", email); revalidatePath("/admin/psychologists");
}
export async function adminSetAppointmentStatus(fd: FormData) {
  const a = await admin(); const id = String(fd.get("id")), status = String(fd.get("status"));
  if (status === "CANCELLED") await cancelAppointment(id, "pro", "Annulé par l'administration");
  else if (["PENDING", "CONFIRMED", "COMPLETED"].includes(status)) await prisma.appointment.update({ where: { id }, data: { status: status as any } }); // note: consultationNotes never selected here
  await audit(a.id, "appointment.status", id, status); revalidatePath("/admin/appointments");
}
export async function updatePlan(fd: FormData) {
  const a = await admin(); const id = String(fd.get("id"));
  await prisma.subscriptionPlan.update({ where: { id }, data: { priceTnd: Math.max(0, Number(fd.get("price")) || 0), sessionsPerMonth: Math.max(0, Number(fd.get("sessions")) || 0), active: fd.get("active") === "on" } });
  await audit(a.id, "plan.update", id); revalidatePath("/admin/subscriptions");
}
export async function addInspiration(fd: FormData) {
  const a = await admin(); const text = String(fd.get("text") || "").trim(); if (!text) return;
  const at = fd.get("publishAt") ? new Date(String(fd.get("publishAt"))) : new Date();
  const m = await prisma.inspirationMessage.create({ data: { text: text.slice(0, 300), category: String(fd.get("category")), kind: String(fd.get("kind") || "message"), publishAt: isNaN(+at) ? new Date() : at } });
  await audit(a.id, "inspiration.create", m.id); revalidatePath("/admin/content");
}
export async function toggleContent(fd: FormData) {
  const a = await admin(); const id = String(fd.get("id")), kind = String(fd.get("kind"));
  if (kind === "inspiration") { const x = await prisma.inspirationMessage.findUnique({ where: { id } }); if (x) await prisma.inspirationMessage.update({ where: { id }, data: { active: !x.active } }); }
  if (kind === "exercise") { const x = await prisma.exercise.findUnique({ where: { id } }); if (x) await prisma.exercise.update({ where: { id }, data: { active: !x.active } }); }
  if (kind === "challenge") { const x = await prisma.challenge.findUnique({ where: { id } }); if (x) await prisma.challenge.update({ where: { id }, data: { active: !x.active } }); }
  await audit(a.id, `${kind}.toggle`, id); revalidatePath("/admin/content");
}
export async function addExercise(fd: FormData) {
  const a = await admin(); const title = String(fd.get("title") || "").trim(); if (!title) return;
  const e = await prisma.exercise.create({ data: { title, slug: title.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + randomBytes(2).toString("hex"), description: String(fd.get("description") || ""), category: String(fd.get("category") || "Mindfulness"), durationMin: Number(fd.get("duration")) || 5, difficulty: String(fd.get("difficulty") || "Facile"), instructions: String(fd.get("instructions") || "").split("\n").map((s) => s.trim()).filter(Boolean) } });
  await audit(a.id, "exercise.create", e.id); revalidatePath("/admin/content");
}
export async function addChallenge(fd: FormData) {
  const a = await admin(); const title = String(fd.get("title") || "").trim(); if (!title) return;
  const c = await prisma.challenge.create({ data: { title, description: String(fd.get("description") || ""), frequency: fd.get("frequency") === "WEEKLY" ? "WEEKLY" : "DAILY" } });
  await audit(a.id, "challenge.create", c.id); revalidatePath("/admin/content");
}
