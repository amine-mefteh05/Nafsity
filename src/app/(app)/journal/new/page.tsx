import { requireRole } from "@/lib/auth";
import { PageTitle } from "@/components/ui";
import { JournalForm } from "@/components/JournalForm";
export default async function Page() { await requireRole("USER"); return <><PageTitle>Nouvelle entrée</PageTitle><JournalForm /></>; }
