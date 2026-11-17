import { prisma } from "./db";
import { addDays, dayToDate, tunisDateStr } from "./date";
import { moodScore } from "./constants";

export async function userStats(userId: string, days: number) {
  const today = tunisDateStr();
  const fromStr = addDays(today, -(days - 1));
  const since = new Date(Date.now() - days * 86400000);
  const [moods, ex, ch, journals, relax, appts, allCh] = await Promise.all([
    prisma.moodEntry.findMany({ where: { userId, date: { gte: dayToDate(fromStr) } }, orderBy: { date: "asc" } }),
    prisma.exerciseCompletion.findMany({ where: { userId, completedAt: { gte: since } }, include: { exercise: true } }),
    prisma.userChallenge.findMany({ where: { userId, completedOn: { gte: dayToDate(fromStr) } } }),
    prisma.journalEntry.findMany({ where: { userId, isDraft: false, createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.relaxationSession.findMany({ where: { userId, completedAt: { gte: since } } }),
    prisma.appointment.count({ where: { userId, status: "COMPLETED", startsAt: { gte: since } } }),
    prisma.userChallenge.findMany({ where: { userId }, select: { completedOn: true }, orderBy: { completedOn: "desc" } }),
  ]);
  // streak: consecutive days (ending today or yesterday) with >= 1 challenge completion
  const set = new Set(allCh.map((c) => c.completedOn.toISOString().slice(0, 10)));
  let cursor = set.has(today) ? today : addDays(today, -1), streak = 0;
  while (set.has(cursor)) { streak++; cursor = addDays(cursor, -1); }

  const dayKey = (d: Date) => tunisDateStr(d);
  const activity: Record<string, number> = {};
  const bump = (k: string) => (activity[k] = (activity[k] ?? 0) + 1);
  moods.forEach((m) => bump(m.date.toISOString().slice(0, 10)));
  ex.forEach((e) => bump(dayKey(e.completedAt)));
  ch.forEach((c) => bump(c.completedOn.toISOString().slice(0, 10)));
  journals.forEach((j) => bump(dayKey(j.createdAt)));
  relax.forEach((r) => bump(dayKey(r.completedAt)));

  const moodLine = moods.map((m) => ({ date: m.date.toISOString().slice(5, 10), score: moodScore(m.mood), intensity: m.intensity }));
  const last7 = Array.from({ length: 7 }, (_, i) => { const k = addDays(today, -(6 - i)); return { date: k.slice(5), count: activity[k] ?? 0 }; });
  const byCat: Record<string, number> = {};
  ex.forEach((e) => (byCat[e.exercise.category] = (byCat[e.exercise.category] ?? 0) + 1));
  const challengeDays = new Set(ch.map((c) => c.completedOn.toISOString().slice(0, 10))).size;
  const challengePct = Math.round((challengeDays / days) * 100);

  const monthStart = today.slice(0, 8) + "01";
  const dim = new Date(Date.UTC(+today.slice(0, 4), +today.slice(5, 7), 0)).getUTCDate();
  const calendar = Array.from({ length: dim }, (_, i) => { const k = monthStart.slice(0, 8) + String(i + 1).padStart(2, "0"); return { day: i + 1, count: activity[k] ?? 0 }; });
  const firstWeekday = new Date(monthStart + "T00:00:00Z").getUTCDay();

  const totals = { mood: moods.length, exercises: ex.length, challenges: ch.length, journal: journals.length, relax: relax.length, appointments: appts };
  const insights = [
    `Tu as noté ton humeur ${moods.length} jour(s) sur les ${days} derniers jours.`,
    `Tu as terminé ${ex.length} exercice(s) bien-être sur cette période.`,
    streak > 0 ? `Tu poursuis ton défi bien-être depuis ${streak} jour(s) consécutif(s).` : "Tu peux commencer un petit défi quand tu te sens prêt(e).",
    `Tu as écrit ${journals.length} entrée(s) de journal et fait ${relax.length} séance(s) de relaxation.`,
  ];
  const [allMoods, allEx, allJ, allRelax] = await Promise.all([
    prisma.moodEntry.count({ where: { userId } }), prisma.exerciseCompletion.count({ where: { userId } }),
    prisma.journalEntry.count({ where: { userId, isDraft: false } }), prisma.relaxationSession.count({ where: { userId } }),
  ]);
  const badges = [
    { name: "Première humeur notée", got: allMoods >= 1 }, { name: "Série de 7 jours", got: streak >= 7 },
    { name: "10 exercices réalisés", got: allEx >= 10 }, { name: "5 entrées de journal", got: allJ >= 5 },
    { name: "3 séances de relaxation", got: allRelax >= 3 }, { name: "Première séance suivie", got: appts >= 1 },
  ];
  return { moodLine, last7, byCat: Object.entries(byCat).map(([name, value]) => ({ name, value })), challengePct, calendar, firstWeekday, streak, totals, insights, badges };
}
