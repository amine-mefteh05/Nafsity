export const LANGS = ["fr", "ar", "en"] as const;
export type Lang = (typeof LANGS)[number];
type D = Record<string, string>;
export const dict: Record<Lang, D> = {
  fr: {
    nav_home: "Accueil", nav_how: "Comment ça marche", nav_psy: "Psychologues", nav_ex: "Exercices", nav_pricing: "Tarifs", nav_faq: "FAQ", nav_contact: "Contact",
    login: "Connexion", register: "Inscription", hero_title: "Prenez soin de votre esprit, un pas à la fois.",
    hero_sub: "Nafsity vous met en relation avec des psychologues qualifiés et vous accompagne au quotidien avec des outils simples : suivi d'humeur, journal, exercices et relaxation.",
    cta_start: "Commencer", cta_psy: "Découvrir les psychologues", how_title: "Comment fonctionne Nafsity",
    s1t: "1. Créez votre compte", s1d: "Inscription rapide et sécurisée.", s2t: "2. Choisissez une formule", s2d: "Basic, Standard ou Premium selon vos besoins.", s3t: "3. Réservez une séance", s3d: "Choisissez un psychologue et un créneau réellement disponible.",
    psy_title: "Nos psychologues", ex_title: "Exercices de bien-être", pricing_title: "Formules d'abonnement", per_month: "TND / mois", sessions: "séances / mois", choose: "Choisir",
    benefits_title: "Pourquoi Nafsity ?", testi_title: "Témoignages", testi_demo: "Exemples de démonstration : ce ne sont pas de vrais témoignages.", faq_title: "Questions fréquentes",
    contact_title: "Contact", emergency: "Nafsity n'est pas un service d'urgence. En cas de danger immédiat, appelez le 190 (SAMU) ou le 197 (Police).",
    welcome: "Bienvenue sur Nafsity 💙", welcome_sub: "Chaque pas vers une meilleure compréhension de soi est un pas vers le mieux-être.", how_feel: "Comment vous sentez-vous aujourd'hui ?", skip: "Passer", continue: "Continuer",
    logout: "Déconnexion", demo: "Démonstration", verified: "Vérifié", book: "Réserver", simulated: "Paiement simulé",
    m_dashboard: "Tableau de bord", m_psy: "Psychologues", m_appts: "Mes rendez-vous", m_ex: "Exercices", m_mood: "Humeur du jour", m_journal: "Journal bien-être", m_challenges: "Défis self-care", m_progress: "Ma progression", m_relax: "Salle de relaxation", m_insp: "Inspiration du jour", m_assistant: "Assistant Nafsity", m_notif: "Notifications", m_profile: "Mon profil", m_sub: "Mon abonnement",
  },
  en: {
    nav_home: "Home", nav_how: "How it works", nav_psy: "Psychologists", nav_ex: "Exercises", nav_pricing: "Pricing", nav_faq: "FAQ", nav_contact: "Contact",
    login: "Log in", register: "Sign up", hero_title: "Take care of your mind. One step at a time.",
    hero_sub: "Nafsity connects you with qualified psychologists and supports your everyday well-being with simple tools: mood tracking, journaling, exercises and relaxation.",
    cta_start: "Get started", cta_psy: "Discover psychologists", how_title: "How Nafsity works",
    s1t: "1. Create your account", s1d: "Quick and secure registration.", s2t: "2. Pick a plan", s2d: "Basic, Standard or Premium to fit your needs.", s3t: "3. Book a session", s3d: "Choose a psychologist and a genuinely available slot.",
    psy_title: "Our psychologists", ex_title: "Wellness exercises", pricing_title: "Subscription plans", per_month: "TND / month", sessions: "sessions / month", choose: "Choose",
    benefits_title: "Why Nafsity?", testi_title: "Testimonials", testi_demo: "Demonstration examples: these are not real testimonials.", faq_title: "Frequently asked questions",
    contact_title: "Contact", emergency: "Nafsity is not an emergency service. If you are in immediate danger, call 190 (SAMU) or 197 (Police).",
    welcome: "Welcome to Nafsity 💙", welcome_sub: "Every step towards understanding yourself is a step towards feeling better.", how_feel: "How are you feeling today?", skip: "Skip", continue: "Continue",
    logout: "Log out", demo: "Demo", verified: "Verified", book: "Book", simulated: "Simulated payment",
    m_dashboard: "Dashboard", m_psy: "Psychologists", m_appts: "My Appointments", m_ex: "Exercises", m_mood: "Daily Mood", m_journal: "Wellness Journal", m_challenges: "Self-Care Challenges", m_progress: "My Progress", m_relax: "Relaxation Room", m_insp: "Daily Inspiration", m_assistant: "Nafsity Assistant", m_notif: "Notifications", m_profile: "My Profile", m_sub: "My Subscription",
  },
  ar: {
    nav_home: "الرئيسية", nav_how: "كيف يعمل", nav_psy: "الأخصائيون", nav_ex: "التمارين", nav_pricing: "الأسعار", nav_faq: "الأسئلة الشائعة", nav_contact: "اتصل بنا",
    login: "تسجيل الدخول", register: "إنشاء حساب", hero_title: "اعتنِ بعقلك، خطوة بعد خطوة.",
    hero_sub: "تربطك نفسيتي بأخصائيين نفسيين مؤهلين وترافقك يوميا بأدوات بسيطة: تتبع المزاج، المذكرات، التمارين والاسترخاء.",
    cta_start: "ابدأ الآن", cta_psy: "اكتشف الأخصائيين", how_title: "كيف تعمل نفسيتي",
    s1t: "١. أنشئ حسابك", s1d: "تسجيل سريع وآمن.", s2t: "٢. اختر باقة", s2d: "أساسية أو قياسية أو مميزة حسب احتياجك.", s3t: "٣. احجز جلسة", s3d: "اختر أخصائيا وموعدا متاحا فعلا.",
    psy_title: "أخصائيونا", ex_title: "تمارين الرفاهية", pricing_title: "باقات الاشتراك", per_month: "دينار / شهر", sessions: "جلسات / شهر", choose: "اختيار",
    benefits_title: "لماذا نفسيتي؟", testi_title: "آراء", testi_demo: "أمثلة توضيحية: ليست آراء حقيقية.", faq_title: "الأسئلة الشائعة",
    contact_title: "اتصل بنا", emergency: "نفسيتي ليست خدمة طوارئ. في حال خطر وشيك اتصل بالرقم 190 (الإسعاف) أو 197 (الشرطة).",
    welcome: "مرحبا بك في نفسيتي 💙", welcome_sub: "كل خطوة نحو فهم نفسك هي خطوة نحو الشعور بتحسن.", how_feel: "كيف تشعر اليوم؟", skip: "تخطي", continue: "متابعة",
    logout: "تسجيل الخروج", demo: "تجريبي", verified: "موثّق", book: "احجز", simulated: "دفع تجريبي",
    m_dashboard: "لوحة التحكم", m_psy: "الأخصائيون", m_appts: "مواعيدي", m_ex: "التمارين", m_mood: "مزاج اليوم", m_journal: "مذكرات الرفاهية", m_challenges: "تحديات العناية بالنفس", m_progress: "تقدمي", m_relax: "غرفة الاسترخاء", m_insp: "إلهام اليوم", m_assistant: "مساعد نفسيتي", m_notif: "الإشعارات", m_profile: "ملفي", m_sub: "اشتراكي",
  },
};
