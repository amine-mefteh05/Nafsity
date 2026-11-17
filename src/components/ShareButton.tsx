"use client";
export function ShareButton({ text }: { text: string }) {
  return <button type="button" className="btn-ghost !py-1.5" onClick={async () => { try { if (navigator.share) await navigator.share({ text }); else { await navigator.clipboard.writeText(text); alert("Message copié"); } } catch {} }}>Partager</button>;
}
