import { prisma } from "./db";
import { isCrisis, CRISIS_MESSAGE } from "./crisis";

export type AssistantProvider = { reply(message: string, history: { role: string; content: string }[]): Promise<string> };

/** Rule-based provider. Facts (prices, plans, exercises) always come from the database. */
export const ruleBasedProvider: AssistantProvider = {
  async reply(message) {
    const q = message.toLowerCase();
    const has = (...w: string[]) => w.some((x) => q.includes(x));
    if (has("abonnement", "prix", "tarif", "plan", "subscription", "price", "اشتراك")) {
      const plans = await prisma.subscriptionPlan.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
      return "Voici les formules actuelles :\n" + plans.map((p) => `• ${p.name} : ${p.priceTnd} TND/mois, ${p.sessionsPerMonth} séances/mois`).join("\n") + "\n\nTu peux choisir ou changer de formule dans « Mon abonnement ». Les paiements actuels sont des simulations (version de développement).";
    }
    if (has("rendez-vous", "réserver", "reserver", "book", "psychologue", "appointment", "annuler", "cancel")) {
      return "Pour réserver : ouvre « Psychologues », choisis un profil, sélectionne une date puis un créneau réellement disponible. Un abonnement actif avec des séances restantes est nécessaire.\n\nPour annuler : « Mes rendez-vous » → Annuler. Une annulation au moins 24 h avant la séance te rend la séance dans ton quota. Je ne peux pas consulter les disponibilités à ta place : elles sont affichées sur chaque profil.";
    }
    if (has("exercice", "relax", "stress", "respir", "dormir", "sommeil", "exercise", "breath")) {
      const ex = await prisma.exercise.findMany({ where: { active: true }, take: 3, orderBy: { durationMin: "asc" } });
      return "Quelques exercices de la bibliothèque :\n" + ex.map((e) => `• ${e.title} (${e.durationMin} min, ${e.category})`).join("\n") + "\n\nTu peux aussi essayer la « Salle de relaxation » (respiration guidée). Tu peux t'arrêter à tout moment.";
    }
    if (has("défi", "defi", "self-care", "challenge", "activité", "activite")) {
      const ch = await prisma.challenge.findMany({ where: { active: true }, take: 3 });
      return "Idées de défis bien-être :\n" + ch.map((c) => `• ${c.title}`).join("\n") + "\n\nChoisis-en un seul et fais-le à ton rythme, sans pression.";
    }
    if (has("humeur", "mood", "journal", "suivi")) {
      return "L'humeur se note dans « Humeur du jour » (une entrée par jour, intensité de 1 à 10). Le journal est dans « Journal bien-être » : privé, visible uniquement par toi. Tes données ne sont pas envoyées à un service d'IA externe.";
    }
    if (has("nafsity", "comment ça marche", "how does", "fonctionne")) {
      return "Nafsity te met en relation avec des psychologues et propose des outils au quotidien : suivi d'humeur, journal, exercices, défis, salle de relaxation et inspirations. Commence par choisir une formule, puis explore ton tableau de bord.";
    }
    return "Je peux t'aider à utiliser Nafsity : abonnements, rendez-vous, exercices, défis, humeur et journal. Je ne suis pas psychologue et je ne peux pas donner de diagnostic ni de conseil médical. Pour un accompagnement, tu peux réserver une séance avec un professionnel.";
  },
};
// Future LLM integration point: implement AssistantProvider with process.env.LLM_API_KEY (server-side only),
// retrieve platform facts from the DB (RAG) and never include journal/mood data.
export function getProvider(): AssistantProvider { return ruleBasedProvider; }

export async function answer(message: string, history: { role: string; content: string }[]) {
  if (isCrisis(message)) return { text: CRISIS_MESSAGE, crisis: true };
  try { return { text: await getProvider().reply(message, history), crisis: false }; }
  catch { return { text: "Désolé, une erreur est survenue. Réessaie dans un instant.", crisis: false }; }
}
