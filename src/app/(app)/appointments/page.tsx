import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { PageTitle, Empty } from "@/components/ui";
import { fmtDateTime } from "@/lib/date";
import { cancelMine, requestReschedule } from "@/app/actions/appointments";
const LABEL: Record<string, string> = { PENDING: "En attente", CONFIRMED: "Confirmé", COMPLETED: "Terminé", CANCELLED: "Annulé" };
export default async function Page() {
  const u = await requireRole("USER");
  const [list, sub] = await Promise.all([
    prisma.appointment.findMany({ where: { userId: u.id }, include: { psychologist: { include: { user: true } } }, orderBy: { startsAt: "desc" } }),
    prisma.subscription.findFirst({ where: { userId: u.id, status: "ACTIVE", endsAt: { gt: new Date() } }, include: { plan: true } }),
  ]);
  const upcoming = list.filter((a) => ["PENDING", "CONFIRMED"].includes(a.status) && a.startsAt > new Date()).reverse();
  const past = list.filter((a) => !upcoming.includes(a));
  const Row = ({ a, actions }: { a: (typeof list)[number]; actions?: boolean }) => (
    <div className="card mb-2 flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
      <div><b>{fmtDateTime(a.startsAt)}</b> — {a.psychologist.user.firstName} {a.psychologist.user.lastName}<div className="text-xs text-muted">{a.sessionDeducted ? "1 séance décomptée" : "Séance restituée"}{a.rescheduleRequested ? " · report demandé" : ""}</div></div>
      <div className="flex items-center gap-2"><span className="badge">{LABEL[a.status]}</span>
        {actions && <><form action={requestReschedule}><input type="hidden" name="id" value={a.id} /><button className="btn-ghost !py-1.5" disabled={a.rescheduleRequested}>Demander un report</button></form>
          <form action={cancelMine}><input type="hidden" name="id" value={a.id} /><button className="btn-danger !py-1.5">Annuler</button></form></>}</div>
    </div>);
  return (<>
    <PageTitle sub={sub ? `Séances utilisées : ${sub.sessionsUsed} · restantes : ${sub.plan.sessionsPerMonth - sub.sessionsUsed}` : "Aucun abonnement actif"}>Mes rendez-vous</PageTitle>
    <p className="mb-4 text-xs text-muted">Politique : une séance est décomptée à la réservation. Annulation au moins 24 h avant, ou refus du psychologue : la séance est restituée.</p>
    <h2 className="mb-2 font-bold">À venir</h2>{upcoming.length ? upcoming.map((a) => <Row key={a.id} a={a} actions />) : <Empty>Aucun rendez-vous à venir.</Empty>}
    <h2 className="mb-2 mt-6 font-bold">Historique</h2>{past.length ? past.map((a) => <Row key={a.id} a={a} />) : <Empty>Aucun historique.</Empty>}
  </>);
}
