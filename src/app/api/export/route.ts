import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
export async function GET() {
  const u = await getSession();
  if (!u) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const id = u.id;
  const [moods, journals, exercises, challenges, relax, appointments, payments, favorites, notifications] = await Promise.all([
    prisma.moodEntry.findMany({ where: { userId: id } }), prisma.journalEntry.findMany({ where: { userId: id } }), prisma.exerciseCompletion.findMany({ where: { userId: id } }),
    prisma.userChallenge.findMany({ where: { userId: id } }), prisma.relaxationSession.findMany({ where: { userId: id } }),
    prisma.appointment.findMany({ where: { userId: id }, select: { startsAt: true, endsAt: true, status: true, createdAt: true } }), // no consultation notes
    prisma.payment.findMany({ where: { userId: id }, select: { amountTnd: true, method: true, status: true, reference: true, isSimulated: true, createdAt: true } }),
    prisma.favoriteInspiration.findMany({ where: { userId: id } }), prisma.notification.findMany({ where: { userId: id } }),
  ]);
  const { passwordHash, resetToken, emailVerifyToken, ...profile } = u;
  return new NextResponse(JSON.stringify({ exportedAt: new Date().toISOString(), profile, moods, journals, exercises, challenges, relax, appointments, payments, favorites, notifications }, null, 2), { headers: { "Content-Type": "application/json", "Content-Disposition": 'attachment; filename="nafsity-export.json"' } });
}
