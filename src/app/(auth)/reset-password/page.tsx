import { AuthShell } from "@/components/AuthShell";
import { ResetForm } from "@/components/AuthForms";
export default function Page({ searchParams }: { searchParams: { token?: string } }) {
  return <AuthShell title="Nouveau mot de passe">{searchParams.token ? <ResetForm token={searchParams.token} /> : <p>Lien invalide.</p>}</AuthShell>;
}
