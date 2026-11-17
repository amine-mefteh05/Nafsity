import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { PageTitle } from "@/components/ui";
import { proSaveProfile } from "@/app/actions/pro";
export default async function Page() {
  const u = await requireRole("PSYCHOLOGIST");
  const p = await prisma.psychologist.findUniqueOrThrow({ where: { userId: u.id }, include: { qualifications: true, specializations: true } });
  return (<><PageTitle sub="Le statut « Vérifié » et les qualifications sont validés uniquement par un administrateur.">Mon profil</PageTitle>
    <form action={proSaveProfile} className="card space-y-3"><textarea name="bio" rows={6} defaultValue={p.bio} className="input" /><div><label className="label">Années d'expérience</label><input name="exp" type="number" min={0} defaultValue={p.experienceYears} className="input max-w-[8rem]" /></div><button className="btn-primary">Enregistrer</button></form>
    <div className="card mt-4 text-sm"><b>Qualifications :</b><ul className="ms-4 list-disc">{p.qualifications.map((q) => <li key={q.id}>{q.title} — {q.institution} {q.verified ? "✓ vérifiée" : "(en attente de vérification)"}</li>)}</ul></div></>);
}
