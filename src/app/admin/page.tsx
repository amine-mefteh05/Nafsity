import { prisma } from "@/lib/db";
import { PageTitle, Stat } from "@/components/ui";
import { fmtDateTime } from "@/lib/date";
export default async function Page() {
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const [users, activeSubs, psys, appts, revenue, byPlan, logs] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }), prisma.subscription.count({ where: { status: "ACTIVE", endsAt: { gt: new Date() } } }), prisma.psychologist.count(), prisma.appointment.count(),
    prisma.payment.aggregate({ _sum: { amountTnd: true }, where: { status: "SUCCESS", createdAt: { gte: monthStart } } }),
    prisma.subscription.groupBy({ by: ["planId"], where: { status: "ACTIVE" }, _count: true }),
    prisma.adminAuditLog.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { admin: true } }),
  ]);
  const plans = await prisma.subscriptionPlan.findMany();
  return (<><PageTitle>Vue d'ensemble</PageTitle>
    <div className="grid gap-4 sm:grid-cols-5"><Stat label="Utilisateurs" value={users} /><Stat label="Abonnements actifs" value={activeSubs} /><Stat label="Psychologues" value={psys} /><Stat label="Rendez-vous" value={appts} /><Stat label="Revenu du mois (simulé)" value={`${revenue._sum.amountTnd ?? 0} TND`} /></div>
    <div className="card mt-4 text-sm"><b>Abonnements actifs par formule :</b> {byPlan.map((b) => `${plans.find((p) => p.id === b.planId)?.name}: ${b._count}`).join(" · ") || "—"}</div>
    <h2 className="mb-2 mt-6 font-bold">Journal d'audit (10 derniers)</h2>{logs.map((l) => <div key={l.id} className="card mb-1 py-2 text-xs">{fmtDateTime(l.createdAt)} · {l.admin.email} · {l.action} · {l.target} {l.detail}</div>)}</>);
}
