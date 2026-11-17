import { prisma } from "@/lib/db";
import { PageTitle } from "@/components/ui";
import { fmtDate } from "@/lib/date";
import { updatePlan } from "@/app/actions/admin";
export default async function Page() {
  const [plans, pays, subs] = await Promise.all([
    prisma.subscriptionPlan.findMany({ orderBy: { sortOrder: "asc" } }), prisma.payment.findMany({ include: { user: { select: { email: true } }, plan: true }, orderBy: { createdAt: "desc" }, take: 30 }),
    prisma.subscription.findMany({ include: { user: { select: { email: true } }, plan: true }, orderBy: { endsAt: "desc" }, take: 30 }),
  ]);
  return (<><PageTitle sub="Tous les paiements sont simulés dans cette version.">Abonnements</PageTitle>
    {plans.map((p) => <form key={p.id} action={updatePlan} className="card mb-2 flex flex-wrap items-center gap-3 py-3 text-sm"><input type="hidden" name="id" value={p.id} /><b className="w-24">{p.name}</b><label>Prix TND <input name="price" type="number" defaultValue={p.priceTnd} className="input !w-24 !py-1" /></label><label>Séances <input name="sessions" type="number" defaultValue={p.sessionsPerMonth} className="input !w-20 !py-1" /></label><label><input type="checkbox" name="active" defaultChecked={p.active} /> Active</label><button className="btn-ghost !py-1">Enregistrer</button></form>)}
    <h2 className="mb-2 mt-6 font-bold">Paiements récents (simulés)</h2>{pays.map((p) => <div key={p.id} className="card mb-1 py-2 text-xs">{fmtDate(p.createdAt)} · {p.user.email} · {p.plan.name} · {p.amountTnd} TND · {p.status} · {p.reference}</div>)}
    <h2 className="mb-2 mt-6 font-bold">Abonnements</h2>{subs.map((s) => <div key={s.id} className="card mb-1 py-2 text-xs">{s.user.email} · {s.plan.name} · {s.status}{s.status === "ACTIVE" && s.endsAt < new Date() ? " (expiré)" : ""} · jusqu'au {fmtDate(s.endsAt)} · {s.sessionsUsed} séance(s) utilisée(s)</div>)}</>);
}
