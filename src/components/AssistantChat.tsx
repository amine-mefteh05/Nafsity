"use client";
import { useRef, useState, useEffect } from "react";
type Msg = { role: "user" | "assistant"; content: string; crisis?: boolean };
const SUGGESTIONS = ["Comment réserver un psychologue ?", "Quels exercices m'aident à me détendre ?", "Comment fonctionne mon abonnement ?", "Où suivre mon humeur ?", "Peux-tu suggérer une activité self-care ?"];
export function AssistantChat({ initial, conversationId }: { initial: Msg[]; conversationId?: string }) {
  const [msgs, setMsgs] = useState<Msg[]>(initial.length ? initial : [{ role: "assistant", content: "Bonjour 💙 Je suis l'assistant Nafsity. Je t'aide à utiliser la plateforme. Je ne suis pas psychologue et ne donne ni diagnostic ni conseil médical." }]);
  const [input, setInput] = useState(""); const [busy, setBusy] = useState(false); const [cid, setCid] = useState(conversationId); const end = useRef<HTMLDivElement>(null);
  useEffect(() => end.current?.scrollIntoView({ behavior: "smooth" }), [msgs, busy]);
  async function send(text: string) {
    if (!text.trim() || busy) return; setInput(""); setMsgs((m) => [...m, { role: "user", content: text }]); setBusy(true);
    try { const r = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text, conversationId: cid }) }); const d = await r.json();
      if (!r.ok) setMsgs((m) => [...m, { role: "assistant", content: d.error ?? "Erreur." }]); else { setCid(d.conversationId); setMsgs((m) => [...m, { role: "assistant", content: d.reply, crisis: d.crisis }]); } }
    catch { setMsgs((m) => [...m, { role: "assistant", content: "Connexion impossible. Réessaie." }]); } finally { setBusy(false); }
  }
  return (
    <div className="card flex h-[70vh] flex-col p-0">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {msgs.map((m, i) => <div key={i} className={`flex ${m.role === "user" ? "justify-end" : ""}`}><div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${m.role === "user" ? "bg-primary text-white" : m.crisis ? "bg-red-50 text-red-900" : "bg-light"}`}>{m.content}</div></div>)}
        {busy && <div className="text-sm text-muted">Nafsity écrit…</div>}<div ref={end} />
      </div>
      <div className="flex flex-wrap gap-2 border-t border-blue-50 p-3">{SUGGESTIONS.map((s) => <button key={s} onClick={() => send(s)} className="badge">{s}</button>)}</div>
      <form className="flex gap-2 p-3" onSubmit={(e) => { e.preventDefault(); send(input); }}><input value={input} maxLength={500} onChange={(e) => setInput(e.target.value)} placeholder="Écris ta question…" className="input" /><button className="btn-primary" disabled={busy}>Envoyer</button></form>
    </div>);
}
