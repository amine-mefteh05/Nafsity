import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { PageTitle } from "@/components/ui";
import { toggleChallenge } from "@/app/actions/wellness";
import { dayToDate, tunisDateStr, addDays } from "@/lib/date";
import { userStats } from "@/lib/stats";
export default async function Page() {
  const u = await requireRole("USER");
  const today = tunisDateStr();
  const weekStart = addDays(today, -((new Date(today + "T00:00:00Z").getUTCDay() + 6) % 7)); // Monday
  const [list, done, stats] = await Promise.all([
    prisma.challenge.findMany({ where: { active: true }, orderBy: { title: "asc" } }),
    prisma.userChallenge.findMany({ where: { userId: u.id, completedOn: { gte: dayToDate(weekStart) } } }),
    userStats(u.id, 30),
  ]);
  const isDone = (c: { id: string; frequency: string }) => done.some((d) => d.challengeId === c.id && (c.frequency === "WEEKLY" || d.completedOn.toISOString().slice(0, 10) === today));
  const section = (title: string, f: "DAILY" | "WEEKLY") => { const items = list.filter((c) => c.frequency === f); const n = items.filter(isDone).length; return (<div className="mb-6">
    <h2 className="mb-2 font-bold">{title} <span className="text-xs text-muted">({n}/{items.length})</span></h2>
    <div className="mb-3 h-2 overflow-hidden rounded-full bg-light"><div className="h-full bg-primary" style={{ width: `${items.length ? (n / items.length) * 100 : 0}%` }} /></div>
    {items.map((c) => <form key={c.id} action={toggleChallenge} className="card mb-2 flex items-center justify-between py-3"><input type="hidden" name="id" value={c.id} /><div><b className="text-sm">{c.title}</b><p className="text-xs text-muted">{c.description}</p></div><button className={isDone(c) ? "btn-primary" : "btn-ghost"}>{isDone(c) ? "✓ Fait" : "Marquer fait"}</button></form>)}</div>); };
  return (<>
    <PageTitle sub="Fais ce qui te convient, à ton rythme. Pas de compétition, juste de la bienveillance.">Défis self-care</PageTitle>
    <div className="card mb-6 flex flex-wrap items-center gap-4 text-sm"><span>🔥 Série actuelle : <b>{stats.streak} jour(s)</b></span><span className="flex flex-wrap gap-1">{stats.badges.map((b) => <span key={b.name} className={`badge ${b.got ? "" : "opacity-40"}`}>{b.got ? "🏅" : "🔒"} {b.name}</span>)}</span></div>
    {section("Aujourd'hui", "DAILY")}{section("Cette semaine", "WEEKLY")}
  </>);
}
