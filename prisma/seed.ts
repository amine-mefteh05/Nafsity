// All users, psychologists and content below are FICTIONAL demonstration data.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();
const PW = "Demo1234!";

async function main() {
  const hash = await bcrypt.hash(PW, 12);
  const plans = [
    { code: "BASIC", name: "Basic", priceTnd: 50, sessionsPerMonth: 2, sortOrder: 1, priorityRequests: false, features: ["2 séances de consultation / mois", "Bibliothèque d'exercices", "Suivi d'humeur quotidien", "Tableau de bord personnel", "Historique des séances"] },
    { code: "STANDARD", name: "Standard", priceTnd: 70, sessionsPerMonth: 3, sortOrder: 2, priorityRequests: false, features: ["3 séances de consultation / mois", "Toutes les fonctions Basic", "Défis self-care personnalisés", "Suivi de progression"] },
    { code: "PREMIUM", name: "Premium", priceTnd: 90, sessionsPerMonth: 4, sortOrder: 3, priorityRequests: true, features: ["4 séances de consultation / mois", "Toutes les fonctions Standard", "Demandes de rendez-vous prioritaires", "Ressources bien-être supplémentaires"] },
  ];
  for (const p of plans) await prisma.subscriptionPlan.upsert({ where: { code: p.code }, update: p, create: p });

  const specs = [["anxiete", "Anxiété et stress", "Anxiety & stress", "القلق والتوتر"], ["couple", "Thérapie de couple", "Couples therapy", "العلاج الزوجي"], ["enfant", "Enfants et adolescents", "Children & teens", "الأطفال والمراهقون"], ["sommeil", "Sommeil", "Sleep", "النوم"], ["confiance", "Confiance en soi", "Self-confidence", "الثقة بالنفس"]];
  for (const [key, nameFr, nameEn, nameAr] of specs) await prisma.specialization.upsert({ where: { key }, update: {}, create: { key, nameFr, nameEn, nameAr } });

  const mk = async (email: string, data: any) => prisma.user.upsert({ where: { email }, update: {}, create: { email, passwordHash: hash, language: "fr", emailVerifiedAt: new Date(), consentAt: new Date(), isDemo: true, ...data } });
  await mk("admin@demo.nafsity.test", { firstName: "Admin", lastName: "Démo", role: "ADMIN" });
  await mk("user@demo.nafsity.test", { firstName: "Sami", lastName: "Démo", role: "USER", phone: "22345678", governorate: "Sfax", dateOfBirth: new Date("1998-05-12") });

  const psys = [
    ["psy1@demo.nafsity.test", "Amel", "Fictive", "Tunis", ["anxiete", "confiance"], ["Français", "Arabe"], 8],
    ["psy2@demo.nafsity.test", "Karim", "Exemple", "Sfax", ["couple", "sommeil"], ["Français", "Arabe", "Anglais"], 5],
    ["psy3@demo.nafsity.test", "Nour", "Modèle", "Sousse", ["enfant", "anxiete"], ["Français", "Arabe"], 11],
  ] as const;
  for (const [email, firstName, lastName, governorate, sp, languages, exp] of psys) {
    const u = await mk(email, { firstName, lastName, role: "PSYCHOLOGIST" });
    const exists = await prisma.psychologist.findUnique({ where: { userId: u.id } });
    if (exists) continue;
    const p = await prisma.psychologist.create({ data: {
      userId: u.id, bio: "[PROFIL FICTIF DE DÉMONSTRATION] Biographie d'exemple pour tester l'application. Ce profil ne correspond à aucun professionnel réel.", experienceYears: exp, languages: [...languages], governorate, isDemo: true, verified: false,
      specializations: { connect: sp.map((key) => ({ key })) },
      qualifications: { create: [{ title: "Qualification fictive (démo)", institution: "Établissement fictif", year: 2015, verified: false }] },
    } });
    for (const weekday of [1, 2, 3, 4, 5]) await prisma.availability.create({ data: { psychologistId: p.id, weekday, startMinute: 540, endMinute: 1020, slotMinutes: 45, breakStartMinute: 720, breakEndMinute: 780 } });
  }

  const ex = [
    ["respiration-4-4-4", "Respiration 4-4-4", "Respiration", 3, "Facile", "Une respiration rythmée pour retrouver le calme.", ["Installez-vous confortablement.", "Inspirez 4 secondes, retenez 4 secondes (ou relâchez doucement), expirez 4 secondes.", "Répétez à votre rythme. Arrêtez-vous à tout moment."]],
    ["relaxation-guidee", "Relaxation guidée", "Relaxation", 10, "Facile", "Détendez progressivement le corps.", ["Allongez-vous ou asseyez-vous.", "Relâchez successivement le front, la mâchoire, les épaules, les bras, les jambes.", "Respirez naturellement."]],
    ["gratitude", "Pratique de gratitude", "Émotions", 5, "Facile", "Notez trois choses pour lesquelles vous êtes reconnaissant(e).", ["Prenez un papier ou votre journal.", "Écrivez trois choses, même petites.", "Relisez-les lentement."]],
    ["reflexion-quotidienne", "Réflexion quotidienne", "Conscience émotionnelle", 7, "Moyen", "Un bilan doux de la journée.", ["Qu'est-ce qui s'est bien passé ?", "Qu'est-ce qui a été difficile ?", "Que ferez-vous demain pour prendre soin de vous ?"]],
    ["affirmations-positives", "Affirmations positives", "Confiance en soi", 4, "Facile", "Répétez des phrases bienveillantes envers vous-même.", ["Choisissez une phrase qui sonne juste pour vous.", "Répétez-la à voix basse trois fois.", "Notez ce que vous ressentez."]],
    ["scan-corporel", "Scan corporel", "Pleine conscience", 8, "Moyen", "Portez attention à chaque partie du corps.", ["Fermez les yeux si c'est confortable.", "Parcourez le corps des pieds à la tête.", "Notez les sensations sans les juger."]],
    ["gestion-stress-54321", "Ancrage 5-4-3-2-1", "Gestion du stress", 4, "Facile", "Revenez au moment présent avec vos cinq sens.", ["Nommez 5 choses que vous voyez.", "4 que vous touchez, 3 que vous entendez.", "2 que vous sentez, 1 que vous goûtez."]],
    ["routine-sommeil", "Routine du soir", "Sommeil", 10, "Facile", "Préparez doucement votre sommeil.", ["Éloignez les écrans.", "Baissez la lumière.", "Faites quelques respirations lentes."]],
  ] as const;
  for (const [slug, title, category, durationMin, difficulty, description, instructions] of ex) await prisma.exercise.upsert({ where: { slug }, update: {}, create: { slug, title, category, durationMin, difficulty, description, instructions: [...instructions] } });

  if ((await prisma.challenge.count()) === 0) await prisma.challenge.createMany({ data: [
    { title: "Boire assez d'eau", description: "Garde une bouteille à portée de main.", frequency: "DAILY" },
    { title: "Marcher 15 minutes", description: "Une courte promenade, à ton rythme.", frequency: "DAILY" },
    { title: "Écrire trois choses que j'apprécie", description: "Même de toutes petites choses.", frequency: "DAILY" },
    { title: "Pratiquer la respiration", description: "Quelques minutes dans la salle de relaxation.", frequency: "DAILY" },
    { title: "Pause réseaux sociaux", description: "Une pause de quelques heures.", frequency: "WEEKLY" },
    { title: "Horaires de sommeil réguliers", description: "Essaie de te coucher à heure fixe.", frequency: "WEEKLY" },
    { title: "Faire quelque chose d'agréable", description: "Une activité juste pour te faire plaisir.", frequency: "WEEKLY" },
  ] });

  if ((await prisma.inspirationMessage.count()) === 0) await prisma.inspirationMessage.createMany({ data: [
    { text: "Ta progression n'a pas besoin d'être parfaite pour être significative.", category: "Acceptation de soi" },
    { text: "Prends un instant pour apprécier le chemin parcouru.", category: "Gratitude" },
    { text: "Le repos fait aussi partie du progrès.", category: "Équilibre émotionnel" },
    { text: "Un petit pas reste un pas en avant.", category: "Motivation" },
    { text: "Tu as le droit d'aller à ton rythme.", category: "Patience" },
    { text: "Ce que tu ressens est valable.", category: "Acceptation de soi" },
    { text: "Commence petit : une minute de calme compte.", category: "Équilibre émotionnel" },
    { text: "Aujourd'hui, je fais de mon mieux, et c'est suffisant.", category: "Confiance en soi", kind: "affirmation" },
    { text: "Je mérite de prendre soin de moi.", category: "Confiance en soi", kind: "affirmation" },
    { text: "Qu'est-ce qui m'a apporté un peu de paix aujourd'hui ?", category: "Gratitude", kind: "reflection" },
    { text: "Essaie de boire un grand verre d'eau et de t'étirer doucement.", category: "Équilibre émotionnel", kind: "recommendation" },
  ] });

  // Race-condition safety net: at most one ACTIVE appointment per psychologist and start time.
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS appointment_active_slot ON "Appointment" ("psychologistId", "startsAt") WHERE status IN ('PENDING','CONFIRMED')`);
  console.log("Seed OK. Demo accounts (fictional), password:", PW);
}
main().finally(() => prisma.$disconnect());
