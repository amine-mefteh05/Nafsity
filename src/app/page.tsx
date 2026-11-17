import Link from "next/link";
import { Heart, ShieldCheck, Smile, Wind } from "lucide-react";
import { prisma } from "@/lib/db";
import { getT } from "@/lib/i18n";
import { getSession, home } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { LangSwitch } from "@/components/LangSwitch";
import { Onboarding } from "@/components/Onboarding";
import { DemoBadge, EmergencyNote } from "@/components/ui";

export default async function Landing() {
  const { t, lang } = getT();
  const [user, psys, exercises, plans] = await Promise.all([
    getSession(),
    prisma.psychologist.findMany({ where: { active: true }, include: { user: true, specializations: true }, take: 3 }),
    prisma.exercise.findMany({ where: { active: true }, take: 4 }),
    prisma.subscriptionPlan.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
  ]);
  const nav = [["#how", "nav_how"], ["#psy", "nav_psy"], ["#ex", "nav_ex"], ["#pricing", "nav_pricing"], ["#faq", "nav_faq"], ["#contact", "nav_contact"]];
  const faq = [
    ["Nafsity remplace-t-il un psychologue ?", "Non. Nafsity met en relation avec des professionnels et propose des outils de bien-être. Ce n'est pas un service d'urgence ni un outil de diagnostic."],
    ["Les paiements sont-ils réels ?", "Pas dans cette version : les paiements sont des simulations pour le développement. Aucune donnée bancaire n'est stockée."],
    ["Mes notes et mon journal sont-ils privés ?", "Oui. Seul vous y avez accès. Les psychologues et administrateurs n'y accèdent pas automatiquement."],
    ["Puis-je annuler un rendez-vous ?", "Oui. Une annulation au moins 24 h avant la séance restitue la séance à votre quota."],
  ];
  return (
    <main>
      <Onboarding lang={lang} t={{ welcome: t("welcome"), welcome_sub: t("welcome_sub"), how_feel: t("how_feel"), skip: t("skip"), continue: t("continue") }} />
      <header className="sticky top-0 z-40 border-b border-blue-50 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link href="/"><Logo /></Link>
          <nav className="hidden flex-1 justify-center gap-4 text-sm font-medium lg:flex">{nav.map(([h, k]) => <a key={h} href={h} className="text-ink hover:text-primary">{t(k)}</a>)}</nav>
          <div className="ms-auto flex items-center gap-2"><LangSwitch />
            {user ? <Link className="btn-primary" href={home(user.role)}>{t("m_dashboard")}</Link> : <><Link className="btn-ghost" href="/login">{t("login")}</Link><Link className="btn-primary" href="/register">{t("register")}</Link></>}
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-b from-light to-mint">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-16 md:grid-cols-2">
          <div className="animate-fadein">
            <h1 className="text-4xl font-extrabold leading-tight text-deep md:text-5xl">{t("hero_title")}</h1>
            <p className="mt-4 text-lg text-muted">{t("hero_sub")}</p>
            <div className="mt-6 flex flex-wrap gap-3"><Link href="/register" className="btn-primary">{t("cta_start")}</Link><Link href="#psy" className="btn-ghost">{t("cta_psy")}</Link></div>
          </div>
          <svg viewBox="0 0 400 300" className="w-full" role="img" aria-label="Illustration">
            <circle cx="200" cy="150" r="120" fill="#BFDBFE" /><circle cx="200" cy="150" r="80" fill="#93C5FD" /><circle cx="200" cy="150" r="45" fill="#2563EB" />
            <path d="M200 175s-26-16-26-34a15 15 0 0 1 26-9 15 15 0 0 1 26 9c0 18-26 34-26 34z" fill="#fff" />
            <circle cx="70" cy="60" r="18" fill="#5EEAD4" opacity=".7" /><circle cx="340" cy="240" r="24" fill="#38BDF8" opacity=".6" />
          </svg>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="mb-6 text-2xl font-extrabold text-deep">{t("how_title")}</h2>
        <div className="grid gap-4 md:grid-cols-3">{[["s1t", "s1d"], ["s2t", "s2d"], ["s3t", "s3d"]].map(([a, b]) => <div key={a} className="card"><h3 className="font-bold text-deep">{t(a)}</h3><p className="mt-1 text-sm text-muted">{t(b)}</p></div>)}</div>
      </section>

      <section id="psy" className="bg-white py-14"><div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-6 text-2xl font-extrabold text-deep">{t("psy_title")}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {psys.map((p) => (
            <div key={p.id} className="card">
              <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-light font-bold text-primary">{p.user.firstName[0]}{p.user.lastName[0]}</div>
                <div><div className="font-bold">{p.user.firstName} {p.user.lastName}</div><div className="text-xs text-muted">{p.governorate}</div></div></div>
              <div className="mt-3 flex flex-wrap gap-1">{p.specializations.map((s) => <span key={s.id} className="badge">{s.nameFr}</span>)}</div>
              <div className="mt-3 flex flex-wrap gap-1">{p.verified ? <span className="badge bg-mint text-teal-700">{t("verified")}</span> : null}{p.isDemo && <DemoBadge />}</div>
            </div>
          ))}
          {psys.length === 0 && <p className="text-sm text-muted">Aucun profil pour le moment.</p>}
        </div>
        <Link href="/psychologists" className="btn-ghost mt-6">{t("nav_psy")} →</Link>
      </div></section>

      <section id="ex" className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="mb-6 text-2xl font-extrabold text-deep">{t("ex_title")}</h2>
        <div className="grid gap-4 md:grid-cols-4">{exercises.map((e) => <div key={e.id} className="card"><span className="badge">{e.category}</span><h3 className="mt-2 font-bold">{e.title}</h3><p className="mt-1 text-xs text-muted">{e.durationMin} min · {e.difficulty}</p></div>)}</div>
      </section>

      <section id="pricing" className="bg-white py-14"><div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-2 text-2xl font-extrabold text-deep">{t("pricing_title")}</h2>
        <p className="mb-6 text-xs text-amber-700">{t("simulated")} — version de développement.</p>
        <div className="grid gap-4 md:grid-cols-3">{plans.map((p) => (
          <div key={p.id} className={`card ${p.code === "STANDARD" ? "ring-2 ring-primary" : ""}`}>
            <h3 className="text-lg font-extrabold text-deep">{p.name}</h3>
            <div className="mt-2 text-3xl font-extrabold">{p.priceTnd} <span className="text-sm font-medium text-muted">{t("per_month")}</span></div>
            <ul className="mt-3 space-y-1 text-sm">{p.features.map((f) => <li key={f}>✓ {f}</li>)}</ul>
            <Link href={user ? `/subscription/checkout?plan=${p.code}` : "/register"} className="btn-primary mt-4 w-full">{t("choose")}</Link>
          </div>))}</div>
      </div></section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="mb-6 text-2xl font-extrabold text-deep">{t("benefits_title")}</h2>
        <div className="grid gap-4 md:grid-cols-4">{[[ShieldCheck, "Données privées"], [Smile, "Suivi d'humeur"], [Wind, "Relaxation guidée"], [Heart, "Accompagnement humain"]].map(([I, l]: any) => <div key={l} className="card flex items-center gap-3"><I className="text-primary" /> <span className="font-semibold">{l}</span></div>)}</div>
        <h2 className="mb-2 mt-12 text-2xl font-extrabold text-deep">{t("testi_title")}</h2>
        <p className="mb-4 text-xs font-semibold text-amber-700">{t("testi_demo")}</p>
        <div className="grid gap-4 md:grid-cols-2">{["« Exemple : un espace calme pour faire le point. » — Utilisateur fictif", "« Exemple : des rappels simples qui aident à garder le rythme. » — Utilisatrice fictive"].map((x) => <div key={x} className="card text-sm italic text-muted">{x}</div>)}</div>
      </section>

      <section id="faq" className="bg-white py-14"><div className="mx-auto max-w-3xl px-4">
        <h2 className="mb-6 text-2xl font-extrabold text-deep">{t("faq_title")}</h2>
        {faq.map(([q, a]) => <details key={q} className="card mb-3"><summary className="cursor-pointer font-semibold">{q}</summary><p className="mt-2 text-sm text-muted">{a}</p></details>)}
      </div></section>

      <section id="contact" className="mx-auto max-w-3xl px-4 py-14">
        <h2 className="mb-3 text-2xl font-extrabold text-deep">{t("contact_title")}</h2>
        <p className="mb-3 text-sm text-muted">Écrivez-nous : <a className="text-primary" href="mailto:contact@nafsity.example">contact@nafsity.example</a> (adresse fictive de développement).</p>
        <EmergencyNote />
      </section>
      <footer className="border-t border-blue-50 bg-white py-8 text-center text-xs text-muted">© {new Date().getFullYear()} Nafsity · {t("emergency")}</footer>
    </main>
  );
}
