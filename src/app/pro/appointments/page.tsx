import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { PageTitle, Empty } from "@/components/ui";
import { fmtDateTime } from "@/lib/date";
import { proConfirm, proReject, proComplete, proRequestReschedule } from "@/app/actions/pro";
export default async function Page() {
  const u = await requireRole("PSYCHOLOGIST");
  const p = await prisma.psychologist.findUniqueOrThrow({ where: { userId: u.id } });
  const list = await prisma.appointment.findMany({ where: { psychologistId: p.id }, include: { user: true }, orderBy: { startsAt: "desc" }, take: 100 });
  return (<><PageTitle sub="Vous voyez le nom du patient et le créneau. Le journal et les humeurs des patients ne vous sont jamais accessibles.">Rendez-vous</PageTitle>
    {list.length === 0 ? <Empty>Aucun rendez-vous.</Empty> : list.map((a) => (
      <div key={a.id} className="card mb-2 py-3 text-sm"><div className="flex flex-wrap items-center justify-between gap-2"><div><b>{fmtDateTime(a.startsAt)}</b> — {a.user.firstName} {a.user.lastName} {a.priority && <span className="badge">Prioritaire</span>} {a.rescheduleRequested && <span className="badge bg-amber-50 text-amber-700">Report demandé</span>}</div><span className="badge">{a.status}</span></div>
        <div className="mt-2 flex flex-wrap gap-2">
          {a.status === "PENDING" && <form action={proConfirm}><input type="hidden" name="id" value={a.id} /><button className="btn-primary !py-1.5">Confirmer</button></form>}
          {["PENDING", "CONFIRMED"].includes(a.status) && <><form action={proReject}><input type="hidden" name="id" value={a.id} /><button className="btn-danger !py-1.5">{a.status === "PENDING" ? "Refuser" : "Annuler"}</button></form><form action={proRequestReschedule}><input type="hidden" name="id" value={a.id} /><button className="btn-ghost !py-1.5">Demander un report</button></form></>}
          {a.status === "CONFIRMED" && a.endsAt < new Date() && <form action={proComplete} className="flex gap-2"><input type="hidden" name="id" value={a.id} /><input name="notes" placeholder="Notes confidentielles (vous seul)" className="input !py-1.5" /><button className="btn-ghost !py-1.5">Marquer terminé</button></form>}
        </div>{a.consultationNotes && <p className="mt-2 rounded-xl bg-light p-2 text-xs">Notes : {a.consultationNotes}</p>}</div>))}</>);
}
