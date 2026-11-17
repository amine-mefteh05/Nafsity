"use client";
import { useEffect, useRef, useState } from "react";
import { recordRelax } from "@/app/actions/wellness";

type Phase = { label: string; sec: number; scale: number };
const MODES: Record<string, { name: string; phases: Phase[] }> = {
  box: { name: "Respiration carrée 4-4-4-4", phases: [{ label: "Inspirez", sec: 4, scale: 1.4 }, { label: "Retenez (ou relâchez doucement)", sec: 4, scale: 1.4 }, { label: "Expirez", sec: 4, scale: 0.8 }, { label: "Pause (respirez normalement)", sec: 4, scale: 0.8 }] },
  slow: { name: "Respiration lente simple", phases: [{ label: "Inspirez doucement", sec: 4, scale: 1.4 }, { label: "Expirez lentement", sec: 6, scale: 0.8 }] },
  relax: { name: "Relaxation guidée", phases: ["Installez-vous confortablement et laissez vos épaules tomber.", "Relâchez le front, la mâchoire et les yeux.", "Sentez le poids de votre corps soutenu par le siège.", "Laissez la respiration trouver son rythme naturel.", "Relâchez les mains, les bras, puis les jambes."].map((l) => ({ label: l, sec: 20, scale: 1 })) },
  mind: { name: "Pleine conscience", phases: ["Portez attention aux sons autour de vous.", "Remarquez trois choses que vous voyez.", "Sentez le contact de vos pieds au sol.", "Observez vos pensées passer, sans les juger.", "Revenez doucement à votre respiration."].map((l) => ({ label: l, sec: 20, scale: 1 })) },
  med: { name: "Courte méditation", phases: ["Fermez les yeux si c'est confortable.", "Comptez mentalement chaque expiration, de 1 à 5.", "Si l'esprit s'égare, recommencez à 1, sans reproche.", "Offrez-vous une pensée bienveillante."].map((l) => ({ label: l, sec: 25, scale: 1 })) },
};
export function RelaxRoom() {
  const [mode, setMode] = useState("box"); const [minutes, setMinutes] = useState(3);
  const [running, setRunning] = useState(false); const [done, setDone] = useState(false); const [sound, setSound] = useState(false);
  const [elapsed, setElapsed] = useState(0); // ms of active session time
  const last = useRef(0); const ctx = useRef<AudioContext | null>(null); const lastPhase = useRef(-1); const saved = useRef(false);
  const phases = MODES[mode].phases; const cycle = phases.reduce((a, p) => a + p.sec, 0); const total = minutes * 60000;

  useEffect(() => { // accurate timer: derives time from Date.now() deltas, not interval counts
    if (!running) return;
    last.current = Date.now();
    const id = setInterval(() => { const n = Date.now(); setElapsed((e) => Math.min(total, e + (n - last.current))); last.current = n; }, 100);
    return () => clearInterval(id);
  }, [running, total]);

  const t = (elapsed / 1000) % cycle; let acc = 0, idx = 0;
  for (let i = 0; i < phases.length; i++) { if (t < acc + phases[i].sec) { idx = i; break; } acc += phases[i].sec; idx = i; }
  const phase = phases[idx]; const left = Math.max(1, Math.ceil(acc + phase.sec - t));

  useEffect(() => { // soft original tone generated with WebAudio at each phase change (no external audio files)
    if (!running || !sound || idx === lastPhase.current) { lastPhase.current = idx; return; }
    lastPhase.current = idx;
    try { ctx.current ??= new AudioContext(); const o = ctx.current.createOscillator(), g = ctx.current.createGain(); o.frequency.value = 330 + idx * 40; g.gain.setValueAtTime(0.0001, ctx.current.currentTime); g.gain.exponentialRampToValueAtTime(0.05, ctx.current.currentTime + 0.2); g.gain.exponentialRampToValueAtTime(0.0001, ctx.current.currentTime + 1.2); o.connect(g).connect(ctx.current.destination); o.start(); o.stop(ctx.current.currentTime + 1.3); } catch {}
  }, [idx, running, sound]);

  useEffect(() => { if (elapsed >= total && running) { setRunning(false); setDone(true); if (!saved.current) { saved.current = true; recordRelax(mode, Math.round(total / 1000)); } } }, [elapsed, total, running, mode]);
  const reset = () => { setRunning(false); setElapsed(0); setDone(false); saved.current = false; lastPhase.current = -1; };
  const breathing = mode === "box" || mode === "slow";
  const scale = running || elapsed > 0 ? phase.scale : 1; const dur = breathing ? phase.sec : 4;
  const fmt = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, "0")}`;
  return (
    <div className="rounded-3xl bg-gradient-to-b from-sky/20 via-light to-mint p-6 text-center">
      <div className="mb-4 flex flex-wrap justify-center gap-2">{Object.entries(MODES).map(([k, m]) => <button key={k} disabled={running} onClick={() => { setMode(k); reset(); }} className={`badge ${k === mode ? "!bg-primary !text-white" : ""}`}>{m.name}</button>)}</div>
      <div className="mb-4 flex items-center justify-center gap-2 text-sm">Durée : {[1, 3, 5, 10].map((m) => <button key={m} disabled={running} onClick={() => { setMinutes(m); reset(); }} className={`badge ${m === minutes ? "!bg-deep !text-white" : ""}`}>{m} min</button>)}</div>
      <div className="flex h-72 items-center justify-center">
        <div className="flex h-44 w-44 items-center justify-center rounded-full bg-primary/80 text-white shadow-soft" style={{ transform: `scale(${scale})`, transition: `transform ${dur}s ease-in-out` }}><span className="text-3xl font-extrabold">{breathing ? left : ""}</span></div>
      </div>
      <p className="min-h-[3rem] text-lg font-semibold text-deep" aria-live="polite">{done ? "Séance terminée. Bravo, prends un instant pour sentir le calme 💙" : running || elapsed > 0 ? phase.label : "Prêt(e) ? Tu peux t'arrêter à tout moment."}</p>
      <p className="text-sm text-muted">Écoulé {fmt(elapsed)} / {fmt(total)}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {!running && elapsed === 0 && <button className="btn-primary" onClick={() => setRunning(true)}>Démarrer</button>}
        {running && <button className="btn-ghost" onClick={() => setRunning(false)}>Pause</button>}
        {!running && elapsed > 0 && !done && <button className="btn-primary" onClick={() => setRunning(true)}>Reprendre</button>}
        <button className="btn-ghost" onClick={reset}>Réinitialiser</button>
        <button className="btn-ghost" onClick={() => setSound((s) => !s)}>Son : {sound ? "activé" : "désactivé"}</button>
      </div>
      <p className="mx-auto mt-4 max-w-md text-xs text-muted">Aucune obligation de retenir ta respiration ou de respirer profondément : respire à ton rythme confortable. Arrête-toi si tu ressens un malaise (vertiges, gêne).</p>
    </div>);
}
