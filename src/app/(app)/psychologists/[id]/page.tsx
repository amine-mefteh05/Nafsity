import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { PageTitle, DemoBadge } from "@/components/ui";
import { addDays, tunisDateStr, fmtTime, fmtDate, tunisMidnightUTC } from "@/lib/date";
import { getFreeSlots, activeSubscription } from "@/lib/booking";
import { BookButton } from "@/components/BookButton";
export default async function Page({ params, searchParams }: { params: { id: string }; searchParams: { date?: string } }) {
  const u = await requireRole("USER");
  const p = await prisma.psychologist.findUnique({ where: { id: params.id }, include: { user: true, specializations: true, qualifications: true, reviews: true } });
  if (!p || !p.active) notFound();
  const today = tunisDateStr();
  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i));
  const date = days.includes(searchParams.date ?? "") ? searchParams.date! : today;
  const [slots, sub] = await Promise.all([getFreeSlots(p.id, date), activeSubscription(u.id)]);
  const avg = p.reviews.length ? (p.reviews.reduce((a, r) => a + r.rating, 0) / p.reviews.length).toFixed(1) : null;
  return (<>
    <PageTitle>{p.title} {p.user.firstName} {p.user.lastName}</PageTitle>
    <div className="grid gap-4 md:grid-cols-3">
      <div className="card md:col-span-2 space-y-3">
        <div className="flex flex-wrap gap-1">{p.verified ? <span className="badge bg-mint text-teal-700">Vérifié par Nafsity</span> : <span className="badge bg-slate-100 text-muted">Qualifications non encore vérifiées</span>}{p.isDemo && <DemoBadge />}{avg && <span className="badge">★ {avg} ({p.reviews.length} avis)</span>}</div>
        <p className="text-sm">{p.bio}</p>
        <div className="text-sm"><b>Spécialisations :</b> {p.specializations.map((s) => s.nameFr).join(", ")}</div>
        <div className="text-sm"><b>Langues :</b> {p.languages.join(", ")} · <b>Gouvernorat :</b> {p.governorate} · <b>Expérience :</b> {p.experienceYears} ans</div>
        <div className="text-sm"><b>Qualifications :</b><ul className="ms-4 list-disc">{p.qualifications.map((q) => <li key={q.id}>{q.title} — {q.institution}{q.year ? ` (${q.year})` : ""} {q.verified ? "✓" : "(non vérifiée)"}</li>)}</ul></div>
      </div>
      <div className="card"><h2 className="mb-2 font-bold">Disponibilités</h2>
        {!sub && <p className="mb-2 rounded-xl bg-amber-50 p-2 text-xs text-amber-800">Un abonnement actif est nécessaire pour réserver. <Link className="underline" href="/subscription">Choisir une formule</Link></p>}
        <div className="mb-3 flex gap-1 overflow-x-auto pb-1">{days.map((d) => <Link key={d} href={`?date=${d}`} className={`shrink-0 rounded-xl border px-2 py-1 text-xs ${d === date ? "border-primary bg-light font-bold" : "border-slate-200"}`}>{d.slice(5)}</Link>)}</div>
        <p className="mb-2 text-xs text-muted">{fmtDate(tunisMidnightUTC(date))} (heure de Tunis)</p>
        {slots.length ? <div className="flex flex-wrap gap-2">{slots.map((s) => <BookButton key={s.toISOString()} psychologistId={p.id} startIso={s.toISOString()} label={fmtTime(s)} disabled={!sub} />)}</div> : <p className="text-sm text-muted">Aucun créneau disponible ce jour-là.</p>}
      </div>
    </div></>);
}
