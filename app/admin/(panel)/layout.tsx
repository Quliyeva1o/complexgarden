import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin/session";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  return <AdminShell session={session}>{children}</AdminShell>;
}
