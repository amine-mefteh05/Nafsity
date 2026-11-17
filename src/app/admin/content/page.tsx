import { prisma } from "@/lib/db";
import { PageTitle } from "@/components/ui";
import { INSPIRATION_CATEGORIES } from "@/lib/constants";
import { addInspiration, toggleContent, addExercise, addChallenge } from "@/app/actions/admin";
export default async function Page() {
  const [insp, ex, ch] = await Promise.all([prisma.inspirationMessage.findMany({ orderBy: { publishAt: "desc" }, take: 40 }), prisma.exercise.findMany({ orderBy: { title: "asc" } }), prisma.challenge.findMany({ orderBy: { title: "asc" } })]);
  const T = ({ kind, id, active }: { kind: string; id: string; active: boolean }) => <form action={toggleContent}><input type="hidden" name="id" value={id} /><input type="hidden" name="kind" value={kind} /><button className="btn-ghost !py-1">{active ? "Désactiver" : "Activer"}</button></form>;
  return (<><PageTitle sub="Contenus rédigés pour Nafsity. Pas de citations inventées attribuées à des personnes réelles.">Contenus</PageTitle>
    <h2 className="mb-2 font-bold">Inspirations</h2>
    <form action={addInspiration} className="card mb-3 grid gap-2 sm:grid-cols-4"><input name="text" required maxLength={300} placeholder="Message" className="input sm:col-span-4" /><select name="category" className="input">{INSPIRATION_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select><select name="kind" className="input"><option value="message">Message</option><option value="affirmation">Affirmation</option><option value="reflection">Question de réflexion</option><option value="recommendation">Recommandation</option></select><input type="datetime-local" name="publishAt" className="input" /><button className="btn-primary">Ajouter</button></form>
    {insp.map((m) => <div key={m.id} className="card mb-1 flex items-center justify-between py-2 text-sm"><span>{m.text} <span className="badge">{m.category}</span> {!m.active && <span className="badge bg-slate-100">inactif</span>}</span><T kind="inspiration" id={m.id} active={m.active} /></div>)}
    <h2 className="mb-2 mt-6 font-bold">Exercices</h2>
    <form action={addExercise} className="card mb-3 grid gap-2 sm:grid-cols-4"><input name="title" required placeholder="Titre" className="input" /><input name="category" placeholder="Catégorie" className="input" /><input name="duration" type="number" placeholder="Minutes" className="input" /><input name="difficulty" placeholder="Difficulté" className="input" /><input name="description" placeholder="Description" className="input sm:col-span-4" /><textarea name="instructions" placeholder="Une instruction par ligne" rows={3} className="input sm:col-span-4" /><button className="btn-primary">Ajouter</button></form>
    {ex.map((e) => <div key={e.id} className="card mb-1 flex items-center justify-between py-2 text-sm"><span>{e.title} <span className="badge">{e.category}</span></span><T kind="exercise" id={e.id} active={e.active} /></div>)}
    <h2 className="mb-2 mt-6 font-bold">Défis</h2>
    <form action={addChallenge} className="card mb-3 grid gap-2 sm:grid-cols-4"><input name="title" required placeholder="Titre" className="input" /><input name="description" placeholder="Description" className="input sm:col-span-2" /><select name="frequency" className="input"><option value="DAILY">Quotidien</option><option value="WEEKLY">Hebdomadaire</option></select><button className="btn-primary">Ajouter</button></form>
    {ch.map((c) => <div key={c.id} className="card mb-1 flex items-center justify-between py-2 text-sm"><span>{c.title} <span className="badge">{c.frequency}</span></span><T kind="challenge" id={c.id} active={c.active} /></div>)}
    <p className="mt-6 text-xs text-muted">Base de connaissances de l'assistant : non implémentée dans cette version (les réponses proviennent directement des plans, exercices et défis en base).</p></>);
}
