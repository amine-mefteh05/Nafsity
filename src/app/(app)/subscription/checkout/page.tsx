import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { PageTitle } from "@/components/ui";
import { PAYMENT_METHODS } from "@/lib/constants";
import { payAction } from "@/app/actions/subscription";
export default async function Page({ searchParams }: { searchParams: { plan?: string } }) {
  await requireRole("USER");
  const plan = await prisma.subscriptionPlan.findUnique({ where: { code: searchParams.plan ?? "" } });
  if (!plan) notFound();
  return (<>
    <PageTitle>Récapitulatif de la commande</PageTitle>
    <form action={payAction} className="card max-w-lg space-y-4">
      <input type="hidden" name="plan" value={plan.code} />
      <div><b>{plan.name}</b> — {plan.priceTnd} TND / mois · {plan.sessionsPerMonth} séances</div>
      <div className="rounded-2xl bg-amber-50 p-3 text-xs text-amber-800"><b>SIMULATION.</b> Aucun paiement réel n'est effectué et aucune donnée bancaire n'est demandée ni stockée. Changer de formule démarre une nouvelle période de 30 jours avec un nouveau quota de séances.</div>
      <fieldset className="space-y-2"><legend className="label">Méthode de paiement</legend>
        {PAYMENT_METHODS.map((m, i) => <label key={m.key} className="flex items-center gap-2 text-sm"><input type="radio" name="method" value={m.key} defaultChecked={i === 0} /> {m.label}</label>)}</fieldset>
      <button className="btn-primary w-full">Simuler le paiement de {plan.priceTnd} TND</button>
    </form></>);
}
