import { prisma } from "@/lib/db";
import { PageTitle } from "@/components/ui";
import { fmtDateTime, tunisMidnightUTC, addDays } from "@/lib/date";
import { adminSetAppointmentStatus } from "@/app/actions/admin";
export default async function Page({ searchParams: s }: { searchParams: { psy?: string; date?: string } }) {
  const psys = await prisma.psychologist.findMany({ include: { user: true } });
  const list = await prisma.appointment.findMany({ where: { ...(s.psy ? { psychologistId: s.psy } : {}), ...(s.date ? { startsAt: { gte: tunisMidnightUTC(s.date), lt: tunisMidnightUTC(addDays(s.date, 1)) } } : {}) },
    select: { id: true, startsAt: true, status: true, user: { select: { firstName: true, lastName: true } }, psychologist: { select: { user: { select: { firstName: true, lastName: true } } } } }, orderBy: { startsAt: "desc" }, take: 100 }); // consultationNotes intentionally not selected
  return (<><PageTitle>Rendez-vous</PageTitle>
    <form className="card mb-4 flex flex-wrap gap-2"><select name="psy" defaultValue={s.psy ?? ""} className="input max-w-xs"><option value="">Tous les psychologues</option>{psys.map((p) => <option key={p.id} value={p.id}>{p.user.firstName} {p.user.lastName}</option>)}</select><input type="date" name="date" defaultValue={s.date} className="input max-w-[11rem]" /><button className="btn-ghost">Filtrer</button></form>
    {list.map((a) => <form key={a.id} action={adminSetAppointmentStatus} className="card mb-2 flex flex-wrap items-center justify-between gap-2 py-3 text-sm"><span>{fmtDateTime(a.startsAt)} · {a.user.firstName} {a.user.lastName} → {a.psychologist.user.firstName} {a.psychologist.user.lastName}</span>
      <span className="flex gap-2"><input type="hidden" name="id" value={a.id} /><select name="status" defaultValue={a.status} className="input !py-1">{["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((x) => <option key={x}>{x}</option>)}</select><button className="btn-ghost !py-1">Appliquer</button></span></form>)}</>);
}
