import { requireRole } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("USER");
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar userId={user.id} />
      <main className="flex-1 p-4 md:p-8"><div className="mx-auto max-w-5xl">{children}</div></main>
    </div>
  );
}
