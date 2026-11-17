"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { registerSchema, loginSchema, type RegisterInput } from "@/lib/validators";
import { GOVERNORATES } from "@/lib/constants";
import { registerUser, loginUser, forgotPassword, resetPassword } from "@/app/actions/auth";

const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => <div><label className="label">{label}</label>{children}{error && <p className="err">{error}</p>}</div>;

export function RegisterForm() {
  const r = useRouter(); const [err, setErr] = useState("");
  const f = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });
  const e = f.formState.errors;
  return (
    <form className="grid gap-3 sm:grid-cols-2" onSubmit={f.handleSubmit(async (v) => { const res = await registerUser(v); if (res.error) setErr(res.error); else { r.push("/subscription"); r.refresh(); } })}>
      <Field label="Prénom" error={e.firstName?.message}><input className="input" {...f.register("firstName")} /></Field>
      <Field label="Nom" error={e.lastName?.message}><input className="input" {...f.register("lastName")} /></Field>
      <Field label="Date de naissance" error={e.dateOfBirth?.message}><input type="date" className="input" {...f.register("dateOfBirth")} /></Field>
      <Field label="Téléphone (Tunisie)" error={e.phone?.message}><input className="input" placeholder="+216 22 345 678" {...f.register("phone")} /></Field>
      <Field label="Gouvernorat" error={e.governorate?.message}><select className="input" defaultValue="" {...f.register("governorate")}><option value="" disabled>Choisir…</option>{GOVERNORATES.map((g) => <option key={g}>{g}</option>)}</select></Field>
      <Field label="Email" error={e.email?.message}><input type="email" className="input" {...f.register("email")} /></Field>
      <Field label="Mot de passe" error={e.password?.message}><input type="password" className="input" autoComplete="new-password" {...f.register("password")} /></Field>
      <Field label="Confirmation" error={e.confirmPassword?.message}><input type="password" className="input" autoComplete="new-password" {...f.register("confirmPassword")} /></Field>
      <div className="sm:col-span-2">
        <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" {...f.register("consent")} /> J'accepte les conditions d'utilisation et la politique de confidentialité (version de démonstration, à valider juridiquement avant tout usage réel).</label>
        {e.consent && <p className="err">{e.consent.message}</p>}
      </div>
      {err && <p className="err sm:col-span-2">{err}</p>}
      <button className="btn-primary sm:col-span-2" disabled={f.formState.isSubmitting}>Créer mon compte</button>
      <p className="text-sm sm:col-span-2">Déjà inscrit ? <Link className="text-primary" href="/login">Connexion</Link></p>
    </form>
  );
}

export function LoginForm() {
  const r = useRouter(); const [err, setErr] = useState("");
  const f = useForm<{ email: string; password: string }>({ resolver: zodResolver(loginSchema) });
  return (
    <form className="grid gap-3" onSubmit={f.handleSubmit(async (v) => { const res = await loginUser(v); if (res.error) setErr(res.error); else { r.push(res.to!); r.refresh(); } })}>
      <Field label="Email"><input type="email" className="input" {...f.register("email")} /></Field>
      <Field label="Mot de passe"><input type="password" className="input" {...f.register("password")} /></Field>
      {err && <p className="err">{err}</p>}
      <button className="btn-primary" disabled={f.formState.isSubmitting}>Se connecter</button>
      <div className="flex justify-between text-sm"><Link className="text-primary" href="/forgot-password">Mot de passe oublié ?</Link><Link className="text-primary" href="/register">Créer un compte</Link></div>
    </form>
  );
}

export function ForgotForm() {
  const [done, setDone] = useState(false); const [email, setEmail] = useState("");
  if (done) return <p className="text-sm">Si un compte existe pour cet email, un lien de réinitialisation a été généré. (En développement, il s'affiche dans la console du serveur.)</p>;
  return (<form className="grid gap-3" onSubmit={async (e) => { e.preventDefault(); await forgotPassword(email); setDone(true); }}>
    <Field label="Email"><input type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
    <button className="btn-primary">Envoyer le lien</button></form>);
}

export function ResetForm({ token }: { token: string }) {
  const r = useRouter(); const [pw, setPw] = useState(""); const [err, setErr] = useState("");
  return (<form className="grid gap-3" onSubmit={async (e) => { e.preventDefault(); const res = await resetPassword(token, pw); if (res.error) setErr(res.error); else r.push("/login"); }}>
    <Field label="Nouveau mot de passe"><input type="password" className="input" value={pw} onChange={(e) => setPw(e.target.value)} /></Field>
    {err && <p className="err">{err}</p>}<button className="btn-primary">Réinitialiser</button></form>);
}
