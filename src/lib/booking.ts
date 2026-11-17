import { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { generateSlots } from "./slots";
import { tunisWeekday, tunisMidnightUTC, addDays, fmtDateTime } from "./date";
import { CANCEL_REFUND_HOURS } from "./constants";
import { notify } from "./notify";

type Tx = Prisma.TransactionClient | typeof prisma;

export async function getFreeSlots(psychologistId: string, dateStr: string, db: Tx = prisma): Promise<Date[]> {
  const rule = await db.availability.findUnique({ where: { psychologistId_weekday: { psychologistId, weekday: tunisWeekday(dateStr) } } });
  if (!rule) return [];
  const dayStart = tunisMidnightUTC(dateStr), dayEnd = tunisMidnightUTC(addDays(dateStr, 1));
  const [appts, blocks] = await Promise.all([
    db.appointment.findMany({ where: { psychologistId, status: { in: ["PENDING", "CONFIRMED"] }, startsAt: { gte: dayStart, lt: dayEnd } }, select: { startsAt: true, endsAt: true } }),
    db.availabilitySlot.findMany({ where: { psychologistId, startsAt: { lt: dayEnd }, endsAt: { gt: dayStart } }, select: { startsAt: true, endsAt: true } }),
  ]);
  return generateSlots(dateStr, rule, [...appts, ...blocks]);
}

export async function activeSubscription(userId: string, db: Tx = prisma) {
  return db.subscription.findFirst({ where: { userId, status: "ACTIVE", endsAt: { gt: new Date() } }, include: { plan: true }, orderBy: { endsAt: "desc" } });
}

/**
 * Session policy: one session is deducted from the monthly quota when a booking is made.
 * It is refunded when the booking is cancelled/rejected at least 24h before the start (or by the psychologist).
 */
export async function bookAppointment(userId: string, psychologistId: string, startIso: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const start = new Date(startIso);
  if (isNaN(+start)) return { ok: false, error: "Créneau invalide." };
  const dateStr = new Date(start.getTime() + 3600000).toISOString().slice(0, 10); // Tunis date
  try {
    await prisma.$transaction(async (tx) => {
      const sub = await activeSubscription(userId, tx);
      if (!sub) throw new Error("Un abonnement actif est nécessaire pour réserver.");
      if (sub.sessionsUsed >= sub.plan.sessionsPerMonth) throw new Error("Vous avez utilisé toutes vos séances de la période.");
      const psy = await tx.psychologist.findUnique({ where: { id: psychologistId }, include: { user: true } });
      if (!psy || !psy.active) throw new Error("Psychologue indisponible.");
      const rule = await tx.availability.findUnique({ where: { psychologistId_weekday: { psychologistId, weekday: tunisWeekday(dateStr) } } });
      const free = await getFreeSlots(psychologistId, dateStr, tx);
      if (!rule || !free.some((s) => +s === +start)) throw new Error("Ce créneau n'est plus disponible.");
      const end = new Date(start.getTime() + rule.slotMinutes * 60000);
      const a = await tx.appointment.create({ data: { userId, psychologistId, subscriptionId: sub.id, startsAt: start, endsAt: end, priority: sub.plan.priorityRequests } });
      await tx.subscription.update({ where: { id: sub.id }, data: { sessionsUsed: { increment: 1 } } });
      await notify(userId, "appointment", "Demande envoyée", `Votre demande pour le ${fmtDateTime(start)} est en attente de confirmation.`, tx);
      await notify(psy.userId, "appointment", sub.plan.priorityRequests ? "Nouvelle demande (prioritaire)" : "Nouvelle demande", `Rendez-vous demandé le ${fmtDateTime(start)}.`, tx);
      return a;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return { ok: true };
  } catch (e: any) {
    if (e?.code === "P2034" || e?.code === "P2002") return { ok: false, error: "Ce créneau vient d'être réservé. Choisissez-en un autre." };
    return { ok: false, error: e?.message?.startsWith("Un abonnement") || e?.message?.startsWith("Vous avez") || e?.message?.startsWith("Ce créneau") || e?.message?.startsWith("Psychologue") ? e.message : "Réservation impossible." };
  }
}

export async function cancelAppointment(appointmentId: string, by: "user" | "pro", reason?: string) {
  return prisma.$transaction(async (tx) => {
    const a = await tx.appointment.findUnique({ where: { id: appointmentId }, include: { psychologist: true } });
    if (!a || a.status === "CANCELLED" || a.status === "COMPLETED") return false;
    const early = a.startsAt.getTime() - Date.now() >= CANCEL_REFUND_HOURS * 3600000;
    const refund = by === "pro" || early;
    await tx.appointment.update({ where: { id: a.id }, data: { status: "CANCELLED", cancelReason: reason ?? (by === "user" ? "Annulé par l'utilisateur" : "Annulé par le psychologue"), sessionDeducted: !refund } });
    if (refund && a.subscriptionId) await tx.subscription.update({ where: { id: a.subscriptionId }, data: { sessionsUsed: { decrement: 1 } } });
    await notify(by === "user" ? a.psychologist.userId : a.userId, "appointment", "Rendez-vous annulé", `Le rendez-vous du ${fmtDateTime(a.startsAt)} a été annulé.${refund ? " La séance est restituée." : ""}`, tx);
    return true;
  });
}
