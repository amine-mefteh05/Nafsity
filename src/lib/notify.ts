import { prisma } from "./db";
type Client = Pick<typeof prisma, "notification">;
// Future: also dispatch email here (provider abstraction) based on user.notifPrefs.
export async function notify(userId: string, type: string, title: string, body: string, db: Client = prisma) {
  await db.notification.create({ data: { userId, type, title, body } });
}
