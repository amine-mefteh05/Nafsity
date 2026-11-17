import { MOODS, EMOTIONS, JOURNAL_PROMPTS } from "@/lib/constants";
import { saveJournal, deleteJournal } from "@/app/actions/wellness";
import type { JournalEntry } from "@prisma/client";
export function JournalForm({ entry }: { entry?: JournalEntry }) {
  const prompt = JOURNAL_PROMPTS[new Date().getDate() % JOURNAL_PROMPTS.length];
  return (<>
    <form action={saveJournal} className="card space-y-3">
      {entry && <input type="hidden" name="id" value={entry.id} />}
      <p className="rounded-2xl bg-mint p-3 text-sm italic text-teal-800">💭 {prompt}</p>
      <input name="title" required maxLength={120} defaultValue={entry?.title} placeholder="Titre" className="input" />
      <textarea name="content" required rows={14} defaultValue={entry?.content} placeholder="Écris librement…" className="input text-base leading-relaxed" />
      <select name="mood" defaultValue={entry?.mood ?? ""} className="input"><option value="">Humeur (optionnel)</option>{MOODS.map((m) => <option key={m.key} value={m.key}>{m.emoji} {m.fr}</option>)}</select>
      <div className="flex flex-wrap gap-2">{EMOTIONS.map((e) => <label key={e} className="cursor-pointer rounded-full border border-slate-200 px-3 py-1 text-xs has-[:checked]:border-primary has-[:checked]:bg-light"><input type="checkbox" name="emotions" value={e} defaultChecked={entry?.emotions.includes(e)} className="sr-only" />{e}</label>)}</div>
      <input name="tags" defaultValue={entry?.tags.join(", ")} placeholder="Tags séparés par des virgules" className="input" />
      <div className="flex gap-2"><button name="draft" value="1" className="btn-ghost">Enregistrer le brouillon</button><button className="btn-primary">Enregistrer l'entrée</button></div>
    </form>
    {entry && <form action={deleteJournal} className="mt-3"><input type="hidden" name="id" value={entry.id} /><button className="btn-danger">Supprimer cette entrée</button></form>}
  </>);
}
