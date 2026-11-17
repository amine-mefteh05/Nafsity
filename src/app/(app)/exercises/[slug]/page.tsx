import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { PageTitle } from "@/components/ui";
import { completeExercise } from "@/app/actions/wellness";
export default async function Page({ params, searchParams }: { params: { slug: string }; searchParams: { done?: string } }) {
  await requireRole("USER");
  const e = await prisma.exercise.findUnique({ where: { slug: params.slug } });
  if (!e || !e.active) notFound();
  return (<>
    <PageTitle sub={`${e.category} · ${e.durationMin} min · ${e.difficulty}`}>{e.title}</PageTitle>
    <div className="card space-y-4">
      <p>{e.description}</p>
      <ol className="ms-5 list-decimal space-y-1 text-sm">{e.instructions.map((i, k) => <li key={k}>{i}</li>)}</ol>
      <p className="text-xs text-muted">Arrête-toi à tout moment si tu ne te sens pas à l'aise.</p>
      {e.category === "Respiration" && <Link href="/relax" className="btn-ghost">Ouvrir la salle de relaxation</Link>}
      {searchParams.done && <p className="rounded-2xl bg-mint p-3 text-sm text-teal-800">Bravo, exercice enregistré 💙</p>}
      <form action={completeExercise}><input type="hidden" name="slug" value={e.slug} /><button className="btn-primary">Marquer comme terminé</button></form>
    </div></>);
}
