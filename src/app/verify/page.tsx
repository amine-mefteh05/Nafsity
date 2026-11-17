import Link from "next/link";
import { prisma } from "@/lib/db";
import { AuthShell } from "@/components/AuthShell";
export default async function Page({ searchParams }: { searchParams: { token?: string } }) {
  let ok = false;
  if (searchParams.token) {
    const u = await prisma.user.findUnique({ where: { emailVerifyToken: searchParams.token } });
    if (u) { await prisma.user.update({ where: { id: u.id }, data: { emailVerifiedAt: new Date(), emailVerifyToken: null } }); ok = true; }
  }
  return <AuthShell title="Vérification de l'email"><p className="mb-4 text-sm">{ok ? "Votre email est vérifié. Merci !" : "Lien invalide ou déjà utilisé."}</p><Link className="btn-primary" href="/dashboard">Continuer</Link></AuthShell>;
}
