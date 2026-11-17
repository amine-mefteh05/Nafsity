import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import type { Role, User } from "@prisma/client";
import { prisma } from "./db";
import { authSecret, SESSION_COOKIE } from "./secret";

export const hashPassword = (p: string) => bcrypt.hash(p, 12);
export const verifyPassword = (p: string, h: string) => bcrypt.compare(p, h);

export async function createSession(userId: string, role: Role) {
  const token = await new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" }).setSubject(userId).setIssuedAt().setExpirationTime("7d")
    .sign(authSecret());
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7,
  });
}
export function destroySession() { cookies().delete(SESSION_COOKIE); }

export async function getSession(): Promise<User | null> {
  const t = cookies().get(SESSION_COOKIE)?.value;
  if (!t) return null;
  try {
    const { payload } = await jwtVerify(t, authSecret());
    const user = await prisma.user.findUnique({ where: { id: payload.sub as string } });
    return user && user.status === "ACTIVE" ? user : null;
  } catch { return null; }
}

/** Server-side authorization: always re-checks role against the database. */
export async function requireRole(...roles: Role[]): Promise<User> {
  const u = await getSession();
  if (!u) redirect("/login");
  if (!roles.includes(u.role)) redirect(home(u.role));
  return u;
}
export const home = (r: Role) => (r === "ADMIN" ? "/admin" : r === "PSYCHOLOGIST" ? "/pro" : "/dashboard");
