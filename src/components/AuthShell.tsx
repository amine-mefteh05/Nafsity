import Link from "next/link";
import { Logo } from "./Logo";
export function AuthShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-light to-mint p-4">
      <div className="card w-full max-w-xl"><Link href="/"><Logo className="mb-4" /></Link><h1 className="mb-4 text-xl font-extrabold text-deep">{title}</h1>{children}</div>
    </main>
  );
}
