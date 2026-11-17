import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { assistantSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rate";
import { answer } from "@/lib/assistant";

export async function POST(req: Request) {
  const user = await getSession();
  if (!user || user.role !== "USER") return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  if (!rateLimit("ai:" + user.id, 20, 60_000)) return NextResponse.json({ error: "Trop de messages, patientez un instant." }, { status: 429 });
  const parsed = assistantSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Message invalide (1 à 500 caractères)." }, { status: 400 });
  let convId = parsed.data.conversationId;
  if (convId && !(await prisma.aIConversation.findFirst({ where: { id: convId, userId: user.id } }))) convId = undefined;
  const conv = convId ? { id: convId } : await prisma.aIConversation.create({ data: { userId: user.id } });
  const history = await prisma.aIMessage.findMany({ where: { conversationId: conv.id }, orderBy: { createdAt: "asc" }, take: 20 });
  await prisma.aIMessage.create({ data: { conversationId: conv.id, role: "user", content: parsed.data.message } });
  const res = await answer(parsed.data.message, history);
  await prisma.aIMessage.create({ data: { conversationId: conv.id, role: "assistant", content: res.text } });
  return NextResponse.json({ conversationId: conv.id, reply: res.text, crisis: res.crisis });
}
