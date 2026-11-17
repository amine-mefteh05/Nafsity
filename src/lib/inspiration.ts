import { prisma } from "./db";
/** Deterministic "message of the day" among published, active messages. */
export async function todaysInspiration() {
  const list = await prisma.inspirationMessage.findMany({ where: { active: true, publishAt: { lte: new Date() }, kind: "message" }, orderBy: { id: "asc" } });
  if (!list.length) return null;
  const day = Math.floor(Date.now() / 86400000);
  return list[day % list.length];
}
