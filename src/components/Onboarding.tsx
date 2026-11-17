"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { MOODS } from "@/lib/constants";
export function Onboarding({ lang, t }: { lang: "fr" | "ar" | "en"; t: Record<string, string> }) {
  const [open, setOpen] = useState(false); const [picked, setPicked] = useState<string | null>(null);
  useEffect(() => { try { if (!localStorage.getItem("nafsity_onboarded")) setOpen(true); } catch { setOpen(true); } }, []);
  const close = () => { try { localStorage.setItem("nafsity_onboarded", "1"); } catch {} setOpen(false); };
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-deep/40 p-4" role="dialog" aria-modal="true">
      <div className="card w-full max-w-md animate-fadein text-center">
        <h2 className="text-xl font-extrabold text-deep">{t.welcome}</h2>
        <p className="mt-2 text-sm text-muted">{t.welcome_sub}</p>
        <p className="mt-4 font-semibold">{t.how_feel}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {MOODS.map((m) => (
            <button key={m.key} onClick={() => setPicked(m.key)} className={`rounded-2xl border px-3 py-2 text-sm ${picked === m.key ? "border-primary bg-light" : "border-slate-200"}`}>{m.emoji} {m[lang]}</button>
          ))}
        </div>
        <div className="mt-5 flex justify-center gap-2">
          <button className="btn-ghost" onClick={close}>{t.skip}</button>
          <Link href="/register" className="btn-primary" onClick={close}>{t.continue}</Link>
        </div>
      </div>
    </div>
  );
}
