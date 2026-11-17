import { setLang } from "@/app/actions/misc";
export function LangSwitch() {
  return (
    <form action={setLang} className="flex gap-1 text-xs">
      {["fr", "ar", "en"].map((l) => <button key={l} name="lang" value={l} className="rounded-full px-2 py-1 font-semibold uppercase text-deep hover:bg-light">{l}</button>)}
    </form>
  );
}
