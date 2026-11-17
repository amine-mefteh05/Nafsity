import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { PageTitle, Empty } from "@/components/ui";
import { fmtDateTime } from "@/lib/date";
export default async function Page() {
  const u = await requireRole("PSYCHOLOGIST");
  const list = await prisma.notification.findMany({ where: { userId: u.id }, orderBy: { createdAt: "desc" }, take: 50 });
  return (<><PageTitle>Notifications</PageTitle>
    <form action={async () => { "use server"; await prisma.notification.updateMany({ where: { userId: u.id }, data: { read: true } }); }}><button className="btn-ghost mb-3">Tout marquer comme lu</button></form>
    {list.length ? list.map((n) => <div key={n.id} className={`card mb-2 py-3 text-sm ${n.read ? "opacity-70" : ""}`}><b>{n.title}</b> — {n.body}<div className="text-xs text-muted">{fmtDateTime(n.createdAt)}</div></div>) : <Empty>Aucune notification.</Empty>}</>);
}
