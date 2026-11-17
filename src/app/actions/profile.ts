"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireRole, hashPassword, verifyPassword, destroySession } from "@/lib/auth";
import { TN_PHONE, passwordRule } from "@/lib/validators";
import { GOVERNORATES } from "@/lib/constants";

export async function updateProfile(fd: FormData) {
  const u = await requireRole("USER");
  const phone = String(fd.get("phone") ?? ""), gov = String(fd.get("governorate") ?? ""), email = String(fd.get("email") ?? "").trim().toLowerCase();
  if (!TN_PHONE.test(phone) || !GOVERNORATES.includes(gov) || !/^\S+@\S+\.\S+$/.test(email)) return redirect("/profile?error=invalid");
  const other = await prisma.user.findUnique({ where: { email } });
  if (other && other.id !== u.id) return redirect("/profile?error=email");
  const prefs = { appointments: fd.get("n_appt") === "on", challenges: fd.get("n_chal") === "on", inspiration: fd.get("n_insp") === "on", inspirationTime: String(fd.get("insp_time") || "09:00"), email: fd.get("n_email") === "on" };
  await prisma.user.update({ where: { id: u.id }, data: { firstName: String(fd.get("firstName")).trim().slice(0, 60), lastName: String(fd.get("lastName")).trim().slice(0, 60), phone, governorate: gov, email, language: ["fr", "ar", "en"].includes(String(fd.get("language"))) ? String(fd.get("language")) : "fr", notifPrefs: prefs, ...(email !== u.email ? { emailVerifiedAt: null } : {}) } });
  revalidatePath("/profile"); redirect("/profile?saved=1");
}
export async function changePassword(fd: FormData) {
  const u = await requireRole("USER");
  const pw = passwordRule.safeParse(fd.get("new"));
  if (!pw.success || !(await verifyPassword(String(fd.get("current")), u.passwordHash))) return redirect("/profile?error=password");
  await prisma.user.update({ where: { id: u.id }, data: { passwordHash: await hashPassword(pw.data) } });
  redirect("/profile?saved=1");
}
export async function deleteAccount(fd: FormData) {
  const u = await requireRole("USER");
  if (!(await verifyPassword(String(fd.get("password")), u.passwordHash))) return redirect("/profile?error=password");
  await prisma.user.delete({ where: { id: u.id } }); // cascades to all personal data
  destroySession(); redirect("/");
}
