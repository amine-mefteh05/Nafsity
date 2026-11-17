import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { PageTitle, Empty } from "@/components/ui";
import { addDays, tunisDateStr, tunisMidnightUTC, fmtTime, tunisWeekday, tunisDateStr as tds } from "@/lib/date";
import { getFreeSlots } from "@/lib/booking";
const COLOR: Record<string, string> = { PENDING: "bg-amber-100", CONFIRMED: "bg-sky/40", COMPLETED: "bg-mint", CANCELLED: "bg-slate-100 line-through" };
export default async function Page({ searchParams }: { searchParams: { view?: string; date?: string } }) {
  const u = await requireRole("PSYCHOLOGIST");
  const p = await prisma.psychologist.findUniqueOrThrow({ where: { userId: u.id } });
  const view = ["day", "week", "month"].includes(searchParams.view ?? "") ? searchParams.view! : "week";
  const date = /^\d{4}-\d\d-\d\d$/.test(searchParams.date ?? "") ? searchParams.date! : tunisDateStr();
  let from = date, n = 1;
  if (view === "week") { from = addDays(date, -((tunisWeekday(date) + 6) % 7)); n = 7; }
  if (view === "month") { from = date.slice(0, 8) + "01"; n = new Date(Date.UTC(+date.slice(0, 4), +date.slice(5, 7), 0)).getUTCDate(); }
  const days = Array.from({ length: n }, (_, i) => addDays(from, i));
  const [appts, blocks] = await Promise.all([
    prisma.appointment.findMany({ where: { psychologistId: p.id, startsAt: { gte: tunisMidnightUTC(from), lt: tunisMidnightUTC(addDays(from, n)) } }, include: { user: true }, orderBy: { startsAt: "asc" } }),
    prisma.availabilitySlot.findMany({ where: { psychologistId: p.id, startsAt: { lt: tunisMidnightUTC(addDays(from, n)) }, endsAt: { gt: tunisMidnightUTC(from) } } }),
  ]);
  const free = view === "day" ? await getFreeSlots(p.id, date) : [];
  const step = view === "month" ? 30 : view === "week" ? 7 : 1;
  return (<><PageTitle>Mon planning</PageTitle>
    <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">{["day", "week", "month"].map((v) => <a key={v} href={`?view=${v}&date=${date}`} className={`badge ${v === view ? "!bg-primary !text-white" : ""}`}>{v === "day" ? "Jour" : v === "week" ? "Semaine" : "Mois"}</a>)}
      <a className="badge" href={`?view=${view}&date=${addDays(date, -step)}`}>←</a><span>{date}</span><a className="badge" href={`?view=${view}&date=${addDays(date, step)}`}>→</a>
      <span className="ms-auto text-xs text-muted"><i className="badge !bg-amber-100">En attente</i> <i className="badge !bg-sky/40">Confirmé</i> <i className="badge !bg-mint">Terminé</i></span></div>
    {view === "month" ? <div className="card grid grid-cols-7 gap-1 text-center text-xs">{["L", "M", "M", "J", "V", "S", "D"].map((d, i) => <b key={i}>{d}</b>)}{Array.from({ length: (tunisWeekday(from) + 6) % 7 }).map((_, i) => <div key={"e" + i} />)}{days.map((d) => { const c = appts.filter((a) => tds(a.startsAt) === d && a.status !== "CANCELLED").length; const blocked = blocks.some((b) => b.startsAt <= tunisMidnightUTC(d) && b.endsAt > tunisMidnightUTC(d)); return <a key={d} href={`?view=day&date=${d}`} className={`rounded-lg p-2 ${blocked ? "bg-slate-200" : c ? "bg-sky/40" : "bg-light"}`}>{d.slice(8)}{c ? <div className="font-bold">{c}</div> : null}</a>; })}</div>
      : days.map((d) => { const list = appts.filter((a) => tds(a.startsAt) === d); const blocked = blocks.some((b) => b.startsAt <= tunisMidnightUTC(d) && b.endsAt > tunisMidnightUTC(d)); return (
        <div key={d} className="card mb-2 py-3"><b className="text-sm">{d}</b> {blocked && <span className="badge bg-slate-200">Indisponible</span>}
          {list.length ? list.map((a) => <div key={a.id} className={`mt-1 rounded-xl px-3 py-1.5 text-sm ${COLOR[a.status]}`}>{fmtTime(a.startsAt)}–{fmtTime(a.endsAt)} · {a.user.firstName} {a.user.lastName} ({a.status})</div>) : <p className="text-xs text-muted">Aucun rendez-vous.</p>}</div>); })}
    {view === "day" && <div className="card mt-2"><h2 className="mb-2 font-bold">Créneaux libres</h2>{free.length ? <div className="flex flex-wrap gap-2">{free.map((s) => <span key={+s} className="badge">{fmtTime(s)}</span>)}</div> : <Empty>Aucun créneau libre.</Empty>}</div>}</>);
}
