import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { PageTitle } from "@/components/ui";
import { WEEKDAYS } from "@/lib/constants";
import { minToHHMM, fmtDate } from "@/lib/date";
import { saveAvailability, blockDates, unblock } from "@/app/actions/pro";
export default async function Page() {
  const u = await requireRole("PSYCHOLOGIST");
  const p = await prisma.psychologist.findUniqueOrThrow({ where: { userId: u.id }, include: { availability: true, blocks: { where: { endsAt: { gt: new Date() } }, orderBy: { startsAt: "asc" } } } });
  const slot = p.availability[0]?.slotMinutes ?? 45;
  return (<><PageTitle sub="Fuseau Africa/Tunis. Les patients ne voient que les créneaux réellement libres.">Disponibilités</PageTitle>
    <form action={saveAvailability} className="card space-y-3">
      <div><label className="label">Durée d'une séance (minutes)</label><input name="slot" type="number" min={15} max={180} step={5} defaultValue={slot} className="input max-w-[8rem]" /></div>
      {WEEKDAYS.map((d, wd) => { const a = p.availability.find((x) => x.weekday === wd); return (
        <div key={wd} className="grid items-center gap-2 text-sm sm:grid-cols-6"><label className="flex items-center gap-2 font-semibold"><input type="checkbox" name={`on_${wd}`} defaultChecked={!!a} /> {d}</label>
          <input type="time" name={`start_${wd}`} defaultValue={minToHHMM(a?.startMinute ?? 540)} className="input" /><input type="time" name={`end_${wd}`} defaultValue={minToHHMM(a?.endMinute ?? 1020)} className="input" />
          <span className="text-xs text-muted sm:text-end">Pause</span><input type="time" name={`bs_${wd}`} defaultValue={a?.breakStartMinute != null ? minToHHMM(a.breakStartMinute) : ""} className="input" /><input type="time" name={`be_${wd}`} defaultValue={a?.breakEndMinute != null ? minToHHMM(a.breakEndMinute) : ""} className="input" /></div>); })}
      <button className="btn-primary">Enregistrer</button></form>
    <form action={blockDates} className="card mt-4 grid gap-2 sm:grid-cols-5"><h2 className="font-bold sm:col-span-5">Bloquer des dates (congés, jours fériés)</h2><input type="date" name="from" required className="input" /><input type="date" name="to" className="input" /><input name="reason" placeholder="Motif" className="input sm:col-span-2" /><button className="btn-ghost">Bloquer</button></form>
    {p.blocks.map((b) => <form key={b.id} action={unblock} className="card mt-2 flex items-center justify-between py-2 text-sm"><span>{fmtDate(b.startsAt)} → {fmtDate(new Date(+b.endsAt - 1))} {b.reason ? `· ${b.reason}` : ""}</span><input type="hidden" name="id" value={b.id} /><button className="btn-danger !py-1">Retirer</button></form>)}</>);
}
