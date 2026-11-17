import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { PageTitle } from "@/components/ui";
import { MOODS, moodLabel, moodScore } from "@/lib/constants";
import { saveMood } from "@/app/actions/wellness";
import { MoodLine, CatPie } from "@/components/Charts";
import { dayToDate, tunisDateStr, addDays } from "@/lib/date";
export default async function Page({ searchParams }: { searchParams: { range?: string } }) {
  const u = await requireRole("USER");
  const range = searchParams.range === "30" ? 30 : 7; const today = tunisDateStr();
  const entries = await prisma.moodEntry.findMany({ where: { userId: u.id, date: { gte: dayToDate(addDays(today, -(range - 1))) } }, orderBy: { date: "asc" } });
  const todayE = entries.find((e) => e.date.toISOString().slice(0, 10) === today);
  const dist: Record<string, number> = {}; entries.forEach((e) => (dist[moodLabel(e.mood)] = (dist[moodLabel(e.mood)] ?? 0) + 1));
  const map = new Map(entries.map((e) => [e.date.toISOString().slice(0, 10), e]));
  return (<>
    <PageTitle sub="Tes entrées sont privées. Ces données ne constituent pas un diagnostic.">Humeur du jour</PageTitle>
    <form action={saveMood} className="card mb-6 space-y-3">
      <div className="flex flex-wrap gap-2">{MOODS.map((m) => <label key={m.key} className="cursor-pointer rounded-2xl border border-slate-200 px-3 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-light"><input type="radio" name="mood" value={m.key} required defaultChecked={todayE?.mood === m.key} className="sr-only" /> {m.emoji} {m.fr}</label>)}</div>
      <div><label className="label">Intensité (1-10)</label><input type="range" name="intensity" min={1} max={10} defaultValue={todayE?.intensity ?? 5} className="w-full" /></div>
      <textarea name="note" maxLength={1000} defaultValue={todayE?.note ?? ""} placeholder="Note privée (optionnel)" className="input" rows={2} />
      <button className="btn-primary">{todayE ? "Mettre à jour" : "Enregistrer"}</button>
    </form>
    <div className="mb-3 flex gap-2 text-sm"><a href="?range=7" className="badge">7 jours</a><a href="?range=30" className="badge">30 jours</a></div>
    <div className="grid gap-4 md:grid-cols-2">
      <div className="card"><h2 className="mb-2 font-bold">Évolution</h2><MoodLine data={entries.map((e) => ({ date: e.date.toISOString().slice(5, 10), score: moodScore(e.mood) }))} /></div>
      <div className="card"><h2 className="mb-2 font-bold">Répartition</h2><CatPie data={Object.entries(dist).map(([name, value]) => ({ name, value }))} /></div>
    </div>
    <div className="card mt-4"><h2 className="mb-2 font-bold">Calendrier</h2><div className="grid grid-cols-7 gap-1 text-center text-xs">{Array.from({ length: range }, (_, i) => { const k = addDays(today, -(range - 1 - i)); const e = map.get(k); return <div key={k} className="rounded-xl bg-light p-1.5" title={e ? moodLabel(e.mood) : ""}><div className="text-muted">{k.slice(8)}</div><div className="text-lg">{e ? MOODS.find((m) => m.key === e.mood)?.emoji : "·"}</div></div>; })}</div></div>
    <p className="mt-3 text-sm text-muted">{entries.length ? `Tu as noté ton humeur ${entries.length} jour(s) sur les ${range} derniers jours.` : "Aucune entrée sur cette période."}</p>
  </>);
}
