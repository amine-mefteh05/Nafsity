import { AuthShell } from "@/components/AuthShell";
import { LoginForm } from "@/components/AuthForms";
export default function Page() {
  return (<AuthShell title="Connexion"><LoginForm />
    <p className="mt-4 rounded-2xl bg-light p-3 text-xs text-muted">Comptes fictifs de démonstration : user@demo.nafsity.test, psy1@demo.nafsity.test, admin@demo.nafsity.test — mot de passe : Demo1234!</p></AuthShell>);
}
