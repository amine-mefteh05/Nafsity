"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { LANGS } from "@/lib/dict";

export async function setLang(fd: FormData) {
  const l = String(fd.get("lang"));
  if (!(LANGS as readonly string[]).includes(l)) return;
  cookies().set("lang", l, { path: "/", maxAge: 31536000, sameSite: "lax" });
  const u = await getSession();
  if (u) await prisma.user.update({ where: { id: u.id }, data: { language: l } });
  revalidatePath("/", "layout");
}
