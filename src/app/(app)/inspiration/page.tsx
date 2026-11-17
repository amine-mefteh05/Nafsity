import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { PageTitle, Empty } from "@/components/ui";
import { INSPIRATION_CATEGORIES } from "@/lib/constants";
import { toggleFavorite } from "@/app/actions/wellness";
import { ShareButton } from "@/components/ShareButton";
import { todaysInspiration } from "@/lib/inspiration";
export default async function Page({ searchParams }: { searchParams: { cat?: string } }) {
  const u = await requireRole("USER");
  const [today, favs, others] = await Promise.all([
    todaysInspiration(),
    prisma.favoriteInspiration.findMany({ where: { userId: u.id }, include: { message: true } }),
    prisma.inspirationMessage.findMany({ where: { active: true, publishAt: { lte: new Date() }, ...(searchParams.cat ? { category: searchParams.cat } : {}) }, orderBy: { publishAt: "desc" }, take: 30 }),
  ]);
  const favIds = new Set(favs.map((f) => f.messageId));
  const Msg = ({ m }: { m: { id: string; text: string; category: string; kind: string } }) => (
    <div className="card mb-2 flex items-center justify-between gap-3 py-3"><div><p className="text-sm italic">« {m.text} »</p><span className="badge mt-1">{m.category} · {m.kind}</span></div>
      <div className="flex shrink-0 gap-2"><form action={toggleFavorite}><input type="hidden" name="id" value={m.id} /><button className="btn-ghost !py-1.5">{favIds.has(m.id) ? "★ Favori" : "☆ Favori"}</button></form><ShareButton text={m.text} /></div></div>);
  return (<>
    <PageTitle sub="Des messages courts et bienveillants, rédigés pour Nafsity.">Inspiration du jour</PageTitle>
    {today ? <div className="card mb-6 bg-gradient-to-br from-light to-mint text-center"><p className="text-xl font-bold italic text-deep">« {today.text} »</p><div className="mt-3 flex justify-center gap-2"><form action={toggleFavorite}><input type="hidden" name="id" value={today.id} /><button className="btn-primary">{favIds.has(today.id) ? "★ Favori" : "☆ Ajouter aux favoris"}</button></form><ShareButton text={today.text} /></div></div> : <Empty>Aucun message publié aujourd'hui.</Empty>}
    <div className="mb-3 flex flex-wrap gap-2"><a href="?" className="badge">Toutes</a>{INSPIRATION_CATEGORIES.map((c) => <a key={c} href={`?cat=${encodeURIComponent(c)}`} className="badge">{c}</a>)}</div>
    {favs.length > 0 && <><h2 className="mb-2 font-bold">Mes favoris</h2>{favs.map((f) => <Msg key={f.messageId} m={f.message} />)}</>}
    <h2 className="mb-2 mt-4 font-bold">Messages précédents et affirmations</h2>{others.map((m) => <Msg key={m.id} m={m} />)}
  </>);
}
