import { requireRole } from "@/lib/auth";
import { PageTitle } from "@/components/ui";
import { RelaxRoom } from "@/components/RelaxRoom";
export default async function Page() { await requireRole("USER"); return <><PageTitle>Salle de relaxation</PageTitle><RelaxRoom /></>; }
