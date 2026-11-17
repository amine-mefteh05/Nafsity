import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { PageTitle } from "@/components/ui";
export default async function Page({ searchParams }: { searchParams: { cat?: string } }) {
  const u = await requireRole("USER");
  const [all, done] = await Promise.all([
    prisma.exercise.findMany({ where: { active: true }, orderBy: [{ category: "asc" }, { durationMin: "asc" }] }),
    prisma.exerciseCompletion.groupBy({ by: ["exerciseId"], where: { userId: u.id }, _count: true }),
  ]);
  const cats = [...new Set(all.map((e) => e.category))];
  const list = searchParams.cat ? all.filter((e) => e.category === searchParams.cat) : all;
  return (<>
    <PageTitle>Bibliothèque d'exercices</PageTitle>
    <div className="mb-4 flex flex-wrap gap-2"><Link href="/exercises" className="badge">Tous</Link>{cats.map((c) => <Link key={c} href={`?cat=${encodeURIComponent(c)}`} className="badge">{c}</Link>)}</div>
    <div className="grid gap-4 md:grid-cols-3">{list.map((e) => { const n = done.find((d) => d.exerciseId === e.id)?._count ?? 0; return (
      <Link key={e.id} href={`/exercises/${e.slug}`} className="card block hover:-translate-y-0.5 transition"><span className="badge">{e.category}</span><h3 className="mt-2 font-bold">{e.title}</h3><p className="text-sm text-muted line-clamp-2">{e.description}</p><p className="mt-2 text-xs text-muted">{e.durationMin} min · {e.difficulty}{n ? ` · ✓ fait ${n}×` : ""}</p></Link>); })}</div>
  </>);
}
