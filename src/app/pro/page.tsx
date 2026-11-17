import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { PageTitle, Stat } from "@/components/ui";
import { fmtDateTime } from "@/lib/date";
export default async function Page() {
  const u = await requireRole("PSYCHOLOGIST");
  const p = await prisma.psychologist.findUniqueOrThrow({ where: { userId: u.id } });
  const [pending, upcoming, done, next] = await Promise.all([
    prisma.appointment.count({ where: { psychologistId: p.id, status: "PENDING" } }), prisma.appointment.count({ where: { psychologistId: p.id, status: "CONFIRMED", startsAt: { gt: new Date() } } }),
    prisma.appointment.count({ where: { psychologistId: p.id, status: "COMPLETED" } }), prisma.appointment.findFirst({ where: { psychologistId: p.id, status: { in: ["PENDING", "CONFIRMED"] }, startsAt: { gt: new Date() } }, orderBy: { startsAt: "asc" } }),
  ]);
  return (<><PageTitle>Bonjour {u.firstName}</PageTitle>
    {!p.verified && <p className="mb-4 rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">Votre profil n'est pas encore vérifié par un administrateur : le badge « Vérifié » n'est pas affiché.</p>}
    <div className="grid gap-4 sm:grid-cols-4"><Stat label="En attente" value={pending} /><Stat label="À venir" value={upcoming} /><Stat label="Terminées" value={done} /><Stat label="Prochain" value={next ? fmtDateTime(next.startsAt) : "—"} /></div></>);
}
