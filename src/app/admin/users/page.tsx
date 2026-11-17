import { prisma } from "@/lib/db";
import { PageTitle } from "@/components/ui";
import { toggleUserStatus } from "@/app/actions/admin";
export default async function Page({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q?.trim();
  const users = await prisma.user.findMany({ where: q ? { OR: [{ email: { contains: q, mode: "insensitive" } }, { firstName: { contains: q, mode: "insensitive" } }, { lastName: { contains: q, mode: "insensitive" } }] } : {},
    select: { id: true, email: true, firstName: true, lastName: true, role: true, status: true, isDemo: true, subscriptions: { where: { status: "ACTIVE", endsAt: { gt: new Date() } }, include: { plan: true }, take: 1 } }, orderBy: { createdAt: "desc" }, take: 100 }); // no journal/mood fields selected
  return (<><PageTitle>Utilisateurs</PageTitle><form className="mb-4 flex gap-2"><input name="q" defaultValue={q} placeholder="Nom ou email" className="input max-w-sm" /><button className="btn-ghost">Rechercher</button></form>
    <div className="card overflow-x-auto p-0"><table className="w-full text-sm"><tbody>{users.map((u) => <tr key={u.id} className="border-b"><td className="p-3">{u.firstName} {u.lastName} {u.isDemo && <span className="badge">démo</span>}<div className="text-xs text-muted">{u.email}</div></td><td>{u.role}</td><td>{u.subscriptions[0]?.plan.name ?? "Sans abonnement"}</td><td>{u.status}</td>
      <td>{u.role !== "ADMIN" && <form action={toggleUserStatus}><input type="hidden" name="id" value={u.id} /><button className="btn-ghost !py-1">{u.status === "ACTIVE" ? "Suspendre" : "Réactiver"}</button></form>}</td></tr>)}</tbody></table></div></>);
}
