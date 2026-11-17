import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { PageTitle, Empty } from "@/components/ui";
import { MOODS } from "@/lib/constants";
import { fmtDateTime } from "@/lib/date";
export default async function Page({ searchParams: s }: { searchParams: { q?: string; mood?: string; date?: string } }) {
  const u = await requireRole("USER");
  const day = s.date ? new Date(s.date + "T00:00:00+01:00") : null;
  const list = await prisma.journalEntry.findMany({
    where: { userId: u.id, ...(s.mood ? { mood: s.mood } : {}), ...(s.q ? { OR: [{ title: { contains: s.q, mode: "insensitive" } }, { content: { contains: s.q, mode: "insensitive" } }] } : {}), ...(day && !isNaN(+day) ? { createdAt: { gte: day, lt: new Date(+day + 86400000) } } : {}) },
    orderBy: { createdAt: "desc" },
  });
  return (<>
    <PageTitle sub="Privé : visible uniquement par toi. Jamais envoyé à une IA externe.">Journal bien-être</PageTitle>
    <form className="card mb-4 grid gap-2 md:grid-cols-4"><input name="q" defaultValue={s.q} placeholder="Rechercher" className="input" />
      <select name="mood" defaultValue={s.mood ?? ""} className="input"><option value="">Toute humeur</option>{MOODS.map((m) => <option key={m.key} value={m.key}>{m.emoji} {m.fr}</option>)}</select>
      <input type="date" name="date" defaultValue={s.date} className="input" /><button className="btn-ghost">Filtrer</button></form>
    <Link href="/journal/new" className="btn-primary mb-4">Nouvelle entrée</Link>
    {list.length === 0 ? <Empty>Aucune entrée.</Empty> : list.map((j) => (
      <Link key={j.id} href={`/journal/${j.id}`} className="card mb-2 block py-3"><div className="flex justify-between"><b>{j.title}</b><span className="text-xs text-muted">{fmtDateTime(j.createdAt)}</span></div>
        <p className="line-clamp-2 text-sm text-muted">{j.content}</p><div className="mt-1 flex gap-1">{j.isDraft && <span className="badge bg-amber-50 text-amber-700">Brouillon</span>}{j.tags.map((t) => <span key={t} className="badge">#{t}</span>)}</div></Link>))}
  </>);
}
