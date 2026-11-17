import Link from "next/link";
import { Home, Users, CalendarDays, Dumbbell, Smile, BookHeart, Target, LineChart, Wind, Sparkles, Bot, Bell, User, CreditCard, LogOut } from "lucide-react";
import { Logo } from "./Logo";
import { logout } from "@/app/actions/auth";
import { prisma } from "@/lib/db";
import { getT } from "@/lib/i18n";
const items = [
  ["/dashboard", "m_dashboard", Home], ["/psychologists", "m_psy", Users], ["/appointments", "m_appts", CalendarDays], ["/exercises", "m_ex", Dumbbell], ["/mood", "m_mood", Smile],
  ["/journal", "m_journal", BookHeart], ["/challenges", "m_challenges", Target], ["/progress", "m_progress", LineChart], ["/relax", "m_relax", Wind], ["/inspiration", "m_insp", Sparkles],
  ["/assistant", "m_assistant", Bot], ["/notifications", "m_notif", Bell], ["/profile", "m_profile", User], ["/subscription", "m_sub", CreditCard],
] as const;
export async function Sidebar({ userId, extra }: { userId: string; extra?: { href: string; label: string }[] }) {
  const { t } = getT();
  const unread = await prisma.notification.count({ where: { userId, read: false } });
  return (
    <aside className="flex w-full flex-col gap-1 border-b border-blue-50 bg-white p-3 md:min-h-screen md:w-64 md:border-b-0 md:border-e">
      <Link href="/" className="mb-3 px-2"><Logo /></Link>
      <nav className="flex gap-1 overflow-x-auto md:flex-col">
        {items.map(([href, key, Icon]) => (
          <Link key={href} href={href} className="flex shrink-0 items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium text-ink hover:bg-light">
            <Icon size={18} className="text-primary" /> {t(key)}
            {href === "/notifications" && unread > 0 && <span className="ms-auto rounded-full bg-primary px-2 text-xs text-white">{unread}</span>}
          </Link>
        ))}
        {extra?.map((e) => <Link key={e.href} href={e.href} className="rounded-2xl px-3 py-2 text-sm hover:bg-light">{e.label}</Link>)}
      </nav>
      <form action={logout} className="md:mt-auto"><button className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm text-muted hover:bg-light"><LogOut size={18} /> {t("logout")}</button></form>
    </aside>
  );
}
