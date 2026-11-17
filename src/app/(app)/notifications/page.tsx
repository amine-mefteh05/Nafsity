import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { PageTitle, Empty } from "@/components/ui";
import { markRead } from "@/app/actions/wellness";
import { fmtDateTime } from "@/lib/date";
export default async function Page() {
  const u = await requireRole("USER");
  const list = await prisma.notification.findMany({ where: { userId: u.id }, orderBy: { createdAt: "desc" }, take: 100 });
  return (<>
    <PageTitle sub="Les préférences de notification se règlent dans Mon profil.">Notifications ({list.filter((n) => !n.read).length} non lues)</PageTitle>
    <form action={markRead}><button className="btn-ghost mb-4">Tout marquer comme lu</button></form>
    {list.length === 0 ? <Empty>Aucune notification.</Empty> : list.map((n) => <div key={n.id} className={`card mb-2 flex items-center justify-between py-3 ${n.read ? "opacity-70" : ""}`}><div className="text-sm"><b>{n.title}</b><p className="text-muted">{n.body}</p><span className="text-xs text-muted">{fmtDateTime(n.createdAt)}</span></div>{!n.read && <form action={markRead}><input type="hidden" name="id" value={n.id} /><button className="btn-ghost !py-1.5">Lu</button></form>}</div>)}
  </>);
}
