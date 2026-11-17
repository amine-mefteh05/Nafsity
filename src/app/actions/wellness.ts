"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { moodSchema, journalSchema } from "@/lib/validators";
import { dayToDate, tunisDateStr } from "@/lib/date";

export async function saveMood(fd: FormData) {
  const u = await requireRole("USER");
  const p = moodSchema.safeParse({ mood: fd.get("mood"), intensity: fd.get("intensity"), note: fd.get("note") || undefined });
  if (!p.success) return;
  const date = dayToDate(tunisDateStr());
  await prisma.moodEntry.upsert({ where: { userId_date: { userId: u.id, date } }, update: p.data, create: { ...p.data, userId: u.id, date } });
  revalidatePath("/mood"); revalidatePath("/dashboard");
}
export async function saveJournal(fd: FormData) {
  const u = await requireRole("USER");
  const split = (k: string) => String(fd.get(k) ?? "").split(",").map((x) => x.trim()).filter(Boolean).slice(0, 12);
  const p = journalSchema.safeParse({ title: fd.get("title"), content: fd.get("content"), mood: fd.get("mood") || undefined, emotions: fd.getAll("emotions").map(String), tags: split("tags") });
  if (!p.success) return redirect("/journal?error=1");
  const data = { ...p.data, isDraft: fd.get("draft") === "1", isPrivate: true };
  const id = String(fd.get("id") || "");
  if (id) await prisma.journalEntry.updateMany({ where: { id, userId: u.id }, data }); // owner-only
  else await prisma.journalEntry.create({ data: { ...data, userId: u.id } });
  revalidatePath("/journal"); redirect("/journal");
}
export async function deleteJournal(fd: FormData) {
  const u = await requireRole("USER");
  await prisma.journalEntry.deleteMany({ where: { id: String(fd.get("id")), userId: u.id } });
  revalidatePath("/journal"); redirect("/journal");
}
export async function completeExercise(fd: FormData) {
  const u = await requireRole("USER");
  const ex = await prisma.exercise.findUnique({ where: { slug: String(fd.get("slug")) } });
  if (ex) await prisma.exerciseCompletion.create({ data: { userId: u.id, exerciseId: ex.id } });
  revalidatePath("/exercises"); redirect(`/exercises/${ex?.slug ?? ""}?done=1`);
}
export async function toggleChallenge(fd: FormData) {
  const u = await requireRole("USER");
  const challengeId = String(fd.get("id")); const completedOn = dayToDate(tunisDateStr());
  const key = { userId_challengeId_completedOn: { userId: u.id, challengeId, completedOn } };
  const ex = await prisma.userChallenge.findUnique({ where: key });
  if (ex) await prisma.userChallenge.delete({ where: key });
  else if (await prisma.challenge.findFirst({ where: { id: challengeId, active: true } })) await prisma.userChallenge.create({ data: { userId: u.id, challengeId, completedOn } });
  revalidatePath("/challenges"); revalidatePath("/dashboard");
}
export async function recordRelax(type: string, durationSec: number) {
  const u = await requireRole("USER");
  if (durationSec < 10 || durationSec > 3600) return;
  await prisma.relaxationSession.create({ data: { userId: u.id, type: type.slice(0, 40), durationSec } });
  revalidatePath("/progress");
}
export async function toggleFavorite(fd: FormData) {
  const u = await requireRole("USER");
  const messageId = String(fd.get("id")); const key = { userId_messageId: { userId: u.id, messageId } };
  if (await prisma.favoriteInspiration.findUnique({ where: key })) await prisma.favoriteInspiration.delete({ where: key });
  else await prisma.favoriteInspiration.create({ data: { userId: u.id, messageId } });
  revalidatePath("/inspiration");
}
export async function markRead(fd: FormData) {
  const u = await requireRole("USER");
  const id = fd.get("id");
  await prisma.notification.updateMany({ where: { userId: u.id, ...(id ? { id: String(id) } : {}) }, data: { read: true } });
  revalidatePath("/notifications");
}
