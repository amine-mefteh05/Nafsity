export const GOVERNORATES = ["Ariana","Béja","Ben Arous","Bizerte","Gabès","Gafsa","Jendouba","Kairouan","Kasserine","Kébili","Le Kef","Mahdia","La Manouba","Médenine","Monastir","Nabeul","Sfax","Sidi Bouzid","Siliana","Sousse","Tataouine","Tozeur","Tunis","Zaghouan"];
export const TZ = "Africa/Tunis";
export const MOODS = [
  { key: "happy", emoji: "😄", score: 5, fr: "Heureux", ar: "سعيد", en: "Happy" },
  { key: "calm", emoji: "😌", score: 4, fr: "Calme", ar: "هادئ", en: "Calm" },
  { key: "neutral", emoji: "😐", score: 3, fr: "Neutre", ar: "محايد", en: "Neutral" },
  { key: "anxious", emoji: "😟", score: 2, fr: "Anxieux", ar: "قلق", en: "Anxious" },
  { key: "sad", emoji: "😢", score: 1, fr: "Triste", ar: "حزين", en: "Sad" },
  { key: "stressed", emoji: "😣", score: 2, fr: "Stressé", ar: "متوتر", en: "Stressed" },
  { key: "overwhelmed", emoji: "🤯", score: 1, fr: "Dépassé", ar: "مرهق", en: "Overwhelmed" },
] as const;
export const moodScore = (k: string) => MOODS.find((m) => m.key === k)?.score ?? 3;
export const moodLabel = (k: string, lang: "fr" | "ar" | "en" = "fr") => MOODS.find((m) => m.key === k)?.[lang] ?? k;
export const EMOTIONS = ["Gratitude", "Joie", "Calme", "Colère", "Tristesse", "Peur", "Fierté", "Solitude", "Espoir", "Fatigue"];
export const JOURNAL_PROMPTS = ["Qu'est-ce qui t'a fait sourire aujourd'hui ?", "Qu'est-ce qui a été difficile aujourd'hui ?", "De quoi es-tu reconnaissant(e) ?", "Que voudrais-tu améliorer demain ?", "Qu'as-tu besoin d'exprimer ?"];
export const INSPIRATION_CATEGORIES = ["Confiance en soi", "Motivation", "Gratitude", "Acceptation de soi", "Patience", "Équilibre émotionnel"];
export const EMERGENCY = [{ label: "SAMU (urgences médicales)", number: "190" }, { label: "Police secours", number: "197" }, { label: "Protection civile", number: "198" }];
export const PAYMENT_METHODS = [{ key: "CARD", label: "Carte bancaire (simulation)" }, { key: "EDINAR", label: "Poste Tunisienne / e-DINAR (simulation)" }];
export const WEEKDAYS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
export const CANCEL_REFUND_HOURS = 24; // session returned to the quota if cancelled at least 24h before
export const MIN_BOOKING_LEAD_HOURS = 2;
