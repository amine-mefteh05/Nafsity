import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { PageTitle, Empty } from "@/components/ui";
import { fmtDate } from "@/lib/date";
export default async function Page() {
  const u = await requireRole("USER");
  const [plans, sub, pays] = await Promise.all([
    prisma.subscriptionPlan.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.subscription.findFirst({ where: { userId: u.id, status: "ACTIVE", endsAt: { gt: new Date() } }, include: { plan: true } }),
    prisma.payment.findMany({ where: { userId: u.id }, include: { plan: true }, orderBy: { createdAt: "desc" } }),
  ]);
  return (<>
    <PageTitle sub="Les paiements de cette version sont des simulations : aucune transaction réelle n'a lieu.">Mon abonnement</PageTitle>
    {sub ? <div className="card mb-6"><b>{sub.plan.name}</b> — expire le {fmtDate(sub.endsAt)} · {sub.plan.sessionsPerMonth - sub.sessionsUsed}/{sub.plan.sessionsPerMonth} séances restantes
      <div className="mt-2"><Link className="btn-ghost" href={`/subscription/checkout?plan=${sub.plan.code}`}>Renouveler (simulation)</Link></div></div> : <Empty>Aucun abonnement actif. Choisissez une formule ci-dessous.</Empty>}
    <div className="mt-6 grid gap-4 md:grid-cols-3">{plans.map((p) => (
      <div key={p.id} className="card"><h3 className="font-extrabold text-deep">{p.name}</h3><div className="text-2xl font-extrabold">{p.priceTnd} TND<span className="text-sm text-muted">/mois</span></div>
        <ul className="my-3 space-y-1 text-sm">{p.features.map((f) => <li key={f}>✓ {f}</li>)}</ul>
        <Link className="btn-primary w-full" href={`/subscription/checkout?plan=${p.code}`}>{sub?.plan.code === p.code ? "Renouveler" : sub ? "Changer pour cette formule" : "Choisir"}</Link></div>))}</div>
    <h2 className="mb-2 mt-8 font-bold">Historique des paiements (simulés)</h2>
    {pays.length === 0 ? <Empty>Aucun paiement.</Empty> : <div className="card overflow-x-auto p-0"><table className="w-full text-sm"><thead className="text-start text-xs text-muted"><tr><th className="p-3 text-start">Date</th><th className="text-start">Formule</th><th className="text-start">Montant</th><th className="text-start">Méthode</th><th className="text-start">Réf.</th></tr></thead>
      <tbody>{pays.map((p) => <tr key={p.id} className="border-t"><td className="p-3">{fmtDate(p.createdAt)}</td><td>{p.plan.name}</td><td>{p.amountTnd} TND</td><td>{p.method}</td><td>{p.reference}</td></tr>)}</tbody></table></div>}
  </>);
}
