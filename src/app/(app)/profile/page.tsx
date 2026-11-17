import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { PageTitle } from "@/components/ui";
import { GOVERNORATES } from "@/lib/constants";
import { updateProfile, changePassword, deleteAccount } from "@/app/actions/profile";
export default async function Page({ searchParams }: { searchParams: { saved?: string; error?: string } }) {
  const u = await requireRole("USER");
  const p = (u.notifPrefs ?? {}) as Record<string, any>;
  const F = ({ l, children }: { l: string; children: React.ReactNode }) => <div><label className="label">{l}</label>{children}</div>;
  return (<>
    <PageTitle>Mon profil</PageTitle>
    {searchParams.saved && <p className="mb-3 rounded-2xl bg-mint p-3 text-sm text-teal-800">Modifications enregistrées.</p>}
    {searchParams.error && <p className="mb-3 rounded-2xl bg-red-50 p-3 text-sm text-red-700">Vérifiez les informations saisies ({searchParams.error}).</p>}
    <form action={updateProfile} className="card grid gap-3 md:grid-cols-2">
      <F l="Prénom"><input name="firstName" defaultValue={u.firstName} required className="input" /></F><F l="Nom"><input name="lastName" defaultValue={u.lastName} required className="input" /></F>
      <F l="Email"><input name="email" type="email" defaultValue={u.email} required className="input" /></F><F l="Téléphone"><input name="phone" defaultValue={u.phone ?? ""} required className="input" /></F>
      <F l="Gouvernorat"><select name="governorate" defaultValue={u.governorate ?? ""} className="input">{GOVERNORATES.map((g) => <option key={g}>{g}</option>)}</select></F>
      <F l="Langue"><select name="language" defaultValue={u.language} className="input"><option value="fr">Français</option><option value="ar">العربية</option><option value="en">English</option></select></F>
      <fieldset className="md:col-span-2 space-y-1 text-sm"><legend className="label">Préférences de notification</legend>
        <label className="block"><input type="checkbox" name="n_appt" defaultChecked={p.appointments ?? true} /> Rendez-vous</label>
        <label className="block"><input type="checkbox" name="n_chal" defaultChecked={p.challenges ?? true} /> Défis</label>
        <label className="block"><input type="checkbox" name="n_insp" defaultChecked={p.inspiration ?? true} /> Inspiration quotidienne, à <input type="time" name="insp_time" defaultValue={p.inspirationTime ?? "09:00"} className="rounded border px-1" /></label>
        <label className="block"><input type="checkbox" name="n_email" defaultChecked={p.email ?? false} /> Email (non disponible dans cette version)</label></fieldset>
      <button className="btn-primary md:col-span-2">Enregistrer</button>
    </form>
    <p className="mt-2 text-xs text-muted">La photo de profil n'est pas disponible dans cette version (pas de stockage de fichiers configuré).</p>
    <form action={changePassword} className="card mt-4 grid gap-3 md:grid-cols-3"><F l="Mot de passe actuel"><input name="current" type="password" required className="input" /></F><F l="Nouveau (8+, majuscule, chiffre)"><input name="new" type="password" required className="input" /></F><button className="btn-ghost self-end">Changer</button></form>
    <div className="card mt-4 flex flex-wrap items-center gap-3"><Link href="/subscription" className="btn-ghost">Mon abonnement</Link><a href="/api/export" className="btn-ghost">Exporter mes données (JSON)</a></div>
    <form action={deleteAccount} className="card mt-4 space-y-2 border-red-100"><h2 className="font-bold text-red-700">Supprimer mon compte</h2><p className="text-xs text-muted">Action définitive : toutes vos données personnelles (humeur, journal, rendez-vous…) sont supprimées.</p><input name="password" type="password" placeholder="Mot de passe pour confirmer" required className="input max-w-xs" /><button className="btn-danger">Supprimer définitivement</button></form>
  </>);
}
