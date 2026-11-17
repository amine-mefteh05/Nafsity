"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { bookAction } from "@/app/actions/appointments";
export function BookButton({ psychologistId, startIso, label, disabled }: { psychologistId: string; startIso: string; label: string; disabled?: boolean }) {
  const [pending, start] = useTransition(); const [msg, setMsg] = useState(""); const r = useRouter();
  return (<span>
    <button disabled={disabled || pending} className="btn-ghost !px-3 !py-1.5" onClick={() => { if (!confirm(`Demander ce rendez-vous à ${label} ? Une séance sera décomptée de votre quota.`)) return; start(async () => { const res = await bookAction(psychologistId, startIso); if (res.ok) r.push("/appointments"); else { setMsg(res.error); r.refresh(); } }); }}>{label}</button>
    {msg && <span className="err block">{msg}</span>}</span>);
}
