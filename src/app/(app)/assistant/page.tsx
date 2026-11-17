import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { PageTitle, EmergencyNote } from "@/components/ui";
import { AssistantChat } from "@/components/AssistantChat";
export default async function Page() {
  const u = await requireRole("USER");
  const conv = await prisma.aIConversation.findFirst({ where: { userId: u.id }, orderBy: { createdAt: "desc" }, include: { messages: { orderBy: { createdAt: "asc" }, take: 50 } } });
  return (<>
    <PageTitle sub="Aide à la navigation. Ce n'est pas un psychologue, ni un outil de diagnostic. Ton journal et tes humeurs ne lui sont pas transmis.">Assistant Nafsity</PageTitle>
    <AssistantChat conversationId={conv?.id} initial={(conv?.messages ?? []).map((m) => ({ role: m.role as "user" | "assistant", content: m.content }))} />
    <div className="mt-3"><EmergencyNote /></div>
  </>);
}
