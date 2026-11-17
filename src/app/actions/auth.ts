"use server";
import { redirect } from "next/navigation";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { createSession, destroySession, hashPassword, verifyPassword, home } from "@/lib/auth";
import { registerSchema, loginSchema, passwordRule, type RegisterInput } from "@/lib/validators";
import { rateLimit } from "@/lib/rate";
import { notify } from "@/lib/notify";
import { dayToDate } from "@/lib/date";

const APP = () => process.env.APP_URL || "http://localhost:3000";

export async function registerUser(input: RegisterInput): Promise<{ error?: string }> {
  const p = registerSchema.safeParse(input);
  if (!p.success) return { error: p.error.issues[0].message };
  const d = p.data;
  if (!rateLimit("register", 20, 3600_000)) return { error: "Trop de tentatives. Réessayez plus tard." };
  if (await prisma.user.findUnique({ where: { email: d.email } })) return { error: "Un compte existe déjà avec cet email." };
  const token = randomBytes(24).toString("hex");
  const u = await prisma.user.create({ data: {
    email: d.email, passwordHash: await hashPassword(d.password), firstName: d.firstName, lastName: d.lastName, dateOfBirth: dayToDate(d.dateOfBirth),
    phone: d.phone, governorate: d.governorate, consentAt: new Date(), emailVerifyToken: token,
  } });
  // DEV ONLY: no email provider yet, the verification link is printed to the server console.
  console.log(`[DEV] Lien de vérification pour ${u.email}: ${APP()}/verify?token=${token}`);
  await notify(u.id, "welcome", "Bienvenue sur Nafsity 💙", "Choisissez une formule pour réserver vos séances. Chaque petit pas compte.");
  await createSession(u.id, u.role);
  return {};
}

export async function loginUser(input: { email: string; password: string }): Promise<{ error?: string; to?: string }> {
  const p = loginSchema.safeParse(input);
  if (!p.success) return { error: "Identifiants invalides." };
  if (!rateLimit("login:" + p.data.email, 8, 15 * 60_000)) return { error: "Trop de tentatives. Réessayez dans quelques minutes." };
  const u = await prisma.user.findUnique({ where: { email: p.data.email } });
  if (!u || !(await verifyPassword(p.data.password, u.passwordHash))) return { error: "Email ou mot de passe incorrect." };
  if (u.status !== "ACTIVE") return { error: "Ce compte est suspendu." };
  await createSession(u.id, u.role);
  return { to: home(u.role) };
}

export async function logout() { destroySession(); redirect("/"); }

export async function forgotPassword(email: string): Promise<{ ok: true }> {
  const e = email.trim().toLowerCase();
  if (!rateLimit("forgot:" + e, 3, 3600_000)) return { ok: true };
  const u = await prisma.user.findUnique({ where: { email: e } });
  if (u) {
    const token = randomBytes(24).toString("hex");
    await prisma.user.update({ where: { id: u.id }, data: { resetToken: token, resetExpires: new Date(Date.now() + 3600_000) } });
    console.log(`[DEV] Lien de réinitialisation pour ${e}: ${APP()}/reset-password?token=${token}`);
  }
  return { ok: true }; // same answer whether or not the account exists
}

export async function resetPassword(token: string, password: string): Promise<{ error?: string }> {
  const pw = passwordRule.safeParse(password);
  if (!pw.success) return { error: pw.error.issues[0].message };
  const u = await prisma.user.findUnique({ where: { resetToken: token } });
  if (!u || !u.resetExpires || u.resetExpires < new Date()) return { error: "Lien invalide ou expiré." };
  await prisma.user.update({ where: { id: u.id }, data: { passwordHash: await hashPassword(password), resetToken: null, resetExpires: null } });
  return {};
}
