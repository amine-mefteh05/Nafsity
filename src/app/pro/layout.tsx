import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { logout } from "@/app/actions/auth";
export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireRole("PSYCHOLOGIST");
  const links = [["/pro", "Aperçu"], ["/pro/schedule", "Mon planning"], ["/pro/appointments", "Rendez-vous"], ["/pro/availability", "Disponibilités"], ["/pro/profile", "Mon profil"], ["/pro/notifications", "Notifications"]];
  return (<div className="min-h-screen"><header className="flex flex-wrap items-center gap-2 border-b border-blue-50 bg-white px-4 py-3"><Link href="/pro"><Logo /></Link><span className="badge">Espace psychologue</span>
    <nav className="ms-4 flex flex-wrap gap-1 text-sm">{links.map(([h, l]) => <Link key={h} href={h} className="rounded-xl px-3 py-1.5 hover:bg-light">{l}</Link>)}</nav>
    <form action={logout} className="ms-auto"><button className="btn-ghost !py-1.5">Déconnexion</button></form></header>
    <main className="mx-auto max-w-5xl p-4 md:p-8">{children}</main></div>);
}
