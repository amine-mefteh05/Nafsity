import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Stat, PageTitle, Empty } from "@/components/ui";
import { MOODS, moodLabel } from "@/lib/constants";
import { fmtDateTime, tunisDateStr, dayToDate, addDays } from "@/lib/date";
import { userStats } from "@/lib/stats";
import { todaysInspiration } from "@/lib/inspiration";
export default async function Page() {
  const u = await requireRole("USER");
  const today = tunisDateStr();
  const [sub, next, mood, week, challenge, notifs, ex, insp, stats] = await Promise.all([
    prisma.subscription.findFirst({ where: { userId: u.id, status: "ACTIVE", endsAt: { gt: new Date() } }, include: { plan: true } }),
    prisma.appointment.findFirst({ where: { userId: u.id, status: { in: ["PENDING", "CONFIRMED"] }, startsAt: { gt: new Date() } }, orderBy: { startsAt: "asc" }, include: { psychologist: { include: { user: true } } } }),
    prisma.moodEntry.findUnique({ where: { userId_date: { userId: u.id, date: dayToDate(today) } } }),
    prisma.moodEntry.findMany({ where: { userId: u.id, date: { gte: dayToDate(addDays(today, -6)) } }, orderBy: { date: "asc" } }),
    prisma.challenge.findFirst({ where: { active: true, userChallenges: { none: { userId: u.id, completedOn: dayToDate(today) } } } }),
    prisma.notification.findMany({ where: { userId: u.id }, orderBy: { createdAt: "desc" }, take: 3 }),
    prisma.exercise.findFirst({ where: { active: true }, orderBy: { slug: "asc" }, skip: new Date().getDate() % 5 }),
    todaysInspiration(),
    userStats(u.id, 30),
  ]);
  return (<>
    <PageTitle sub="Chaque petit pas compte.">Bonjour {u.firstName} 💙</PageTitle>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Stat label="Abonnement" value={sub ? sub.plan.name : "Aucun"} hint={sub ? undefined : "Choisissez une formule"} />
      <Stat label="Séances restantes" value={sub ? `${sub.plan.sessionsPerMonth - sub.sessionsUsed}/${sub.plan.sessionsPerMonth}` : "—"} />
      <Stat label="Prochain rendez-vous" value={next ? fmtDateTime(next.startsAt) : "Aucun"} hint={next ? `${next.psychologist.user.firstName} ${next.psychologist.user.lastName}` : undefined} />
      <Stat label="Humeur du jour" value={mood ? `${MOODS.find((m) => m.key === mood.mood)?.emoji} ${moodLabel(mood.mood)}` : <Link href="/mood" className="text-primary text-base">Noter →</Link>} />
    </div>
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      <div className="card"><h2 className="font-bold">Cette semaine</h2><div className="mt-2 flex gap-2">{week.length ? week.map((m) => <span key={m.id} title={m.date.toISOString().slice(0, 10)} className="text-2xl">{MOODS.find((x) => x.key === m.mood)?.emoji}</span>) : <span className="text-sm text-muted">Aucune humeur enregistrée.</span>}</div></div>
      <div className="card"><h2 className="font-bold">Défi du moment</h2>{challenge ? <><p className="mt-1 text-sm">{challenge.title}</p><Link href="/challenges" className="btn-ghost mt-2">Voir les défis</Link></> : <p className="text-sm text-muted">Tous les défis d'aujourd'hui sont faits. Bravo 🎉</p>}</div>
      <div className="card"><h2 className="font-bold">Inspiration du jour</h2>{insp ? <p className="mt-1 text-sm italic">« {insp.text} »</p> : <p className="text-sm text-muted">Aucun message publié.</p>}</div>
      <div className="card"><h2 className="font-bold">Exercice recommandé</h2>{ex ? <><p className="mt-1 text-sm">{ex.title} · {ex.durationMin} min</p><Link href={`/exercises/${ex.slug}`} className="btn-ghost mt-2">Essayer</Link></> : null}</div>
      <div className="card"><h2 className="font-bold">Journal</h2><p className="text-sm text-muted">Un espace privé, rien que pour toi.</p><Link href="/journal/new" className="btn-ghost mt-2">Écrire</Link></div>
      <div className="card"><h2 className="font-bold">Progression (30 j)</h2><ul className="mt-1 text-sm">{stats.insights.slice(0, 3).map((i) => <li key={i}>• {i}</li>)}</ul></div>
    </div>
    <h2 className="mb-2 mt-6 font-bold">Notifications récentes</h2>
    {notifs.length ? notifs.map((n) => <div key={n.id} className="card mb-2 py-3 text-sm"><b>{n.title}</b> — {n.body}</div>) : <Empty>Aucune notification.</Empty>}
  </>);
}
