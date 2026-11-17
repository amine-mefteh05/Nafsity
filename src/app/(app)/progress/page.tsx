import { requireRole } from "@/lib/auth";
import { PageTitle, Stat } from "@/components/ui";
import { userStats } from "@/lib/stats";
import { MoodLine, ActivityBars, CatPie } from "@/components/Charts";
export default async function Page({ searchParams }: { searchParams: { days?: string } }) {
  const u = await requireRole("USER");
  const days = [7, 30, 90].includes(Number(searchParams.days)) ? Number(searchParams.days) : 30;
  const s = await userStats(u.id, days);
  return (<>
    <PageTitle sub="Ces statistiques reflètent ton activité sur Nafsity. Elles ne constituent ni un diagnostic ni une mesure d'amélioration clinique.">Ma progression</PageTitle>
    <div className="mb-4 flex gap-2">{[7, 30, 90].map((d) => <a key={d} href={`?days=${d}`} className={`badge ${d === days ? "!bg-primary !text-white" : ""}`}>{d} jours</a>)}</div>
    <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
      <Stat label="Humeurs" value={s.totals.mood} /><Stat label="Exercices" value={s.totals.exercises} /><Stat label="Défis" value={s.totals.challenges} />
      <Stat label="Journal" value={s.totals.journal} /><Stat label="Relaxation" value={s.totals.relax} /><Stat label="Séances suivies" value={s.totals.appointments} />
    </div>
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      <div className="card"><h2 className="mb-2 font-bold">Évolution de l'humeur</h2><MoodLine data={s.moodLine} /></div>
      <div className="card"><h2 className="mb-2 font-bold">Activité (7 derniers jours)</h2><ActivityBars data={s.last7} /></div>
      <div className="card"><h2 className="mb-2 font-bold">Exercices par catégorie</h2><CatPie data={s.byCat} /></div>
      <div className="card"><h2 className="font-bold">Défis</h2><p className="text-3xl font-extrabold text-primary">{s.challengePct}%</p><p className="text-sm text-muted">des jours avec au moins un défi terminé · série actuelle : {s.streak} jour(s)</p></div>
    </div>
    <div className="card mt-4"><h2 className="mb-2 font-bold">Calendrier d'activité du mois</h2>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">{["L", "M", "M", "J", "V", "S", "D"].map((d, i) => <div key={i} className="text-muted">{d}</div>)}
        {Array.from({ length: (s.firstWeekday + 6) % 7 }).map((_, i) => <div key={"e" + i} />)}
        {s.calendar.map((c) => <div key={c.day} className={`rounded-lg p-1.5 ${c.count > 2 ? "bg-primary text-white" : c.count > 0 ? "bg-sky/40" : "bg-light"}`}>{c.day}</div>)}</div></div>
    <div className="card mt-4"><h2 className="mb-2 font-bold">Observations</h2><ul className="space-y-1 text-sm">{s.insights.map((i) => <li key={i}>• {i}</li>)}</ul></div>
    <div className="card mt-4"><h2 className="mb-2 font-bold">Réussites</h2><div className="flex flex-wrap gap-2">{s.badges.map((b) => <span key={b.name} className={`badge ${b.got ? "" : "opacity-40"}`}>{b.got ? "🏅" : "🔒"} {b.name}</span>)}</div></div>
  </>);
}
