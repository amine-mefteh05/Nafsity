import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { PageTitle } from "@/components/ui";
import { JournalForm } from "@/components/JournalForm";
export default async function Page({ params }: { params: { id: string } }) {
  const u = await requireRole("USER");
  const e = await prisma.journalEntry.findFirst({ where: { id: params.id, userId: u.id } }); // other users get 404
  if (!e) notFound();
  return <><PageTitle>Modifier l'entrée</PageTitle><JournalForm entry={e} /></>;
}
