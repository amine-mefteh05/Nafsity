import { ReactNode } from "react";
export const PageTitle = ({ children, sub }: { children: ReactNode; sub?: string }) => (
  <div className="mb-6"><h1 className="text-2xl font-extrabold text-deep">{children}</h1>{sub && <p className="mt-1 text-sm text-muted">{sub}</p>}</div>
);
export const Stat = ({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) => (
  <div className="card"><div className="text-xs font-semibold uppercase text-muted">{label}</div><div className="mt-1 text-2xl font-extrabold text-deep">{value}</div>{hint && <div className="mt-1 text-xs text-muted">{hint}</div>}</div>
);
export const Empty = ({ children }: { children: ReactNode }) => <div className="rounded-2xl border border-dashed border-blue-100 p-6 text-center text-sm text-muted">{children}</div>;
export const DemoBadge = () => <span className="badge bg-amber-50 text-amber-700">Profil fictif de démonstration</span>;
export const EmergencyNote = () => (
  <p className="rounded-2xl bg-amber-50 p-3 text-xs text-amber-800">Nafsity n'est pas un service d'urgence. En cas de danger immédiat : SAMU 190, Police 197, Protection civile 198. Vérifiez les numéros auprès des autorités locales.</p>
);
