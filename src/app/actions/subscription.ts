"use server";
import { redirect } from "next/navigation";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { notify } from "@/lib/notify";
import { PAYMENT_METHODS } from "@/lib/constants";

/**
 * SIMULATED payment. No card data is collected or stored. The subscription is only
 * activated after the (simulated) payment record is marked SUCCESS.
 * Policy: changing plan starts a new 30-day period with a fresh session quota; the previous one is closed.
 */
export async function payAction(fd: FormData) {
  const user = await requireRole("USER");
  const code = String(fd.get("plan")); const method = String(fd.get("method"));
  if (!PAYMENT_METHODS.some((m) => m.key === method)) throw new Error("Méthode invalide");
  const plan = await prisma.subscriptionPlan.findUnique({ where: { code } });
  if (!plan || !plan.active) throw new Error("Formule inconnue");
  await prisma.$transaction(async (tx) => {
    const pay = await tx.payment.create({ data: { userId: user.id, planId: plan.id, amountTnd: plan.priceTnd, method, status: "SUCCESS", reference: "SIM-" + randomBytes(5).toString("hex").toUpperCase(), isSimulated: true } });
    await tx.subscription.updateMany({ where: { userId: user.id, status: "ACTIVE" }, data: { status: "CANCELLED", endsAt: new Date() } });
    const now = new Date();
    const sub = await tx.subscription.create({ data: { userId: user.id, planId: plan.id, startsAt: now, endsAt: new Date(now.getTime() + 30 * 86400000) } });
    await tx.payment.update({ where: { id: pay.id }, data: { subscriptionId: sub.id } });
    await notify(user.id, "payment", "Paiement confirmé (simulation)", `Formule ${plan.name} activée jusqu'au ${sub.endsAt.toLocaleDateString("fr-TN")}.`, tx);
  });
  redirect("/dashboard");
}
