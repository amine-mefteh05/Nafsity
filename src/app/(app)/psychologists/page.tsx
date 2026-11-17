import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageTitle, DemoBadge, Empty } from "@/components/ui";
import { GOVERNORATES } from "@/lib/constants";
export default async function Page({ searchParams: s }: { searchParams: { q?: string; spec?: string; gov?: string; lang?: string; avail?: string } }) {
  const specs = await prisma.specialization.findMany({ orderBy: { nameFr: "asc" } });
  const list = await prisma.psychologist.findMany({
    where: {
      active: true,
      ...(s.gov ? { governorate: s.gov } : {}), ...(s.lang ? { languages: { has: s.lang } } : {}),
      ...(s.spec ? { specializations: { some: { key: s.spec } } } : {}), ...(s.avail ? { availability: { some: {} } } : {}),
      ...(s.q ? { user: { OR: [{ firstName: { contains: s.q, mode: "insensitive" } }, { lastName: { contains: s.q, mode: "insensitive" } }] } } : {}),
    },
    include: { user: true, specializations: true, qualifications: true }, orderBy: { verified: "desc" },
  });
  const ratings = await prisma.review.groupBy({ by: ["psychologistId"], _avg: { rating: true }, _count: true });
  return (<>
    <PageTitle>Psychologues</PageTitle>
    <form className="card mb-6 grid gap-3 md:grid-cols-6">
      <input name="q" defaultValue={s.q} placeholder="Nom" className="input md:col-span-2" />
      <select name="spec" defaultValue={s.spec ?? ""} className="input"><option value="">Spécialisation</option>{specs.map((x) => <option key={x.id} value={x.key}>{x.nameFr}</option>)}</select>
      <select name="gov" defaultValue={s.gov ?? ""} className="input"><option value="">Gouvernorat</option>{GOVERNORATES.map((g) => <option key={g}>{g}</option>)}</select>
      <select name="lang" defaultValue={s.lang ?? ""} className="input"><option value="">Langue</option>{["Français", "Arabe", "Anglais"].map((l) => <option key={l}>{l}</option>)}</select>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="avail" value="1" defaultChecked={!!s.avail} /> Avec disponibilités</label>
      <button className="btn-primary md:col-span-6">Filtrer</button>
    </form>
    {list.length === 0 ? <Empty>Aucun psychologue ne correspond.</Empty> : <div className="grid gap-4 md:grid-cols-2">{list.map((p) => { const r = ratings.find((x) => x.psychologistId === p.id); return (
      <Link key={p.id} href={`/psychologists/${p.id}`} className="card block transition hover:-translate-y-0.5">
        <div className="flex items-center gap-3"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-light text-lg font-bold text-primary">{p.user.firstName[0]}{p.user.lastName[0]}</div>
          <div><div className="font-bold">{p.title} {p.user.firstName} {p.user.lastName}</div><div className="text-xs text-muted">{p.governorate} · {p.experienceYears} ans d'expérience · {p.languages.join(", ")}</div></div></div>
        <p className="mt-2 line-clamp-2 text-sm text-muted">{p.bio}</p>
        <div className="mt-2 flex flex-wrap gap-1">{p.specializations.map((x) => <span key={x.id} className="badge">{x.nameFr}</span>)}
          {p.verified && <span className="badge bg-mint text-teal-700">Vérifié</span>}{p.isDemo && <DemoBadge />}{r && <span className="badge">★ {r._avg.rating?.toFixed(1)} ({r._count})</span>}</div>
      </Link>); })}</div>}
  </>);
}
