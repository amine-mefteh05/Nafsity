import { prisma } from "@/lib/db";
import { PageTitle, DemoBadge } from "@/components/ui";
import { GOVERNORATES } from "@/lib/constants";
import { togglePsy, createPsychologist } from "@/app/actions/admin";
export default async function Page() {
  const list = await prisma.psychologist.findMany({ include: { user: true, qualifications: true }, orderBy: { createdAt: "desc" } });
  return (<><PageTitle sub="Le badge « Vérifié » n'apparaît qu'après votre validation des qualifications. Ne validez que des justificatifs réellement contrôlés.">Psychologues</PageTitle>
    {list.map((p) => <div key={p.id} className="card mb-2 flex flex-wrap items-center justify-between gap-2 py-3 text-sm"><div><b>{p.user.firstName} {p.user.lastName}</b> · {p.governorate} {p.isDemo && <DemoBadge />}<div className="text-xs text-muted">{p.qualifications.map((q) => `${q.title}${q.verified ? " ✓" : ""}`).join(" · ")}</div></div>
      <div className="flex gap-2"><form action={togglePsy}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="field" value="verified" /><button className="btn-ghost !py-1">{p.verified ? "Retirer la vérification" : "Marquer vérifié"}</button></form>
        <form action={togglePsy}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="field" value="active" /><button className="btn-ghost !py-1">{p.active ? "Désactiver" : "Activer"}</button></form></div></div>)}
    <form action={createPsychologist} className="card mt-6 grid gap-2 sm:grid-cols-3"><h2 className="font-bold sm:col-span-3">Ajouter un psychologue (non vérifié par défaut)</h2><input name="firstName" placeholder="Prénom" required className="input" /><input name="lastName" placeholder="Nom" required className="input" /><input name="email" type="email" placeholder="Email" required className="input" /><select name="governorate" className="input">{GOVERNORATES.map((g) => <option key={g}>{g}</option>)}</select><input name="bio" placeholder="Biographie" className="input sm:col-span-2" /><button className="btn-primary sm:col-span-3">Créer (mot de passe temporaire dans la console serveur)</button></form></>);
}
