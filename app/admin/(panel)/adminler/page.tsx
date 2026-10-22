import type { Metadata } from "next";
import { InviteAdminForm } from "@/components/admin/InviteAdminForm";
import { RemoveAdminButton } from "@/components/admin/RemoveAdminButton";
import { formatDateTime } from "@/lib/admin/format";
import { requireAdmin } from "@/lib/admin/session";
import { createServiceClient } from "@/lib/supabase/service";

export const metadata: Metadata = { title: "Adminlər" };

export default async function AdminsPage() {
  const me = await requireAdmin();
  const service = createServiceClient();
  const [{ data: rows }, { data: users }] = await Promise.all([
    service.from("admins").select("user_id, name, created_at").order("created_at"),
    service.auth.admin.listUsers({ perPage: 200 }),
  ]);
  const byId = new Map(users.users.map((u) => [u.id, u]));

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-h3 text-ink-strong">Adminlər</h1>
      <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
        <section aria-label="Admin siyahısı" className="rounded-card border border-border bg-surface">
          <ul>
            {(rows ?? []).map((row) => {
              const user = byId.get(row.user_id);
              const pendingInvite = user && !user.last_sign_in_at;
              return (
                <li key={row.user_id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4 last:border-b-0">
                  <span>
                    <span className="block font-medium text-ink-strong">
                      {row.name}
                      {row.user_id === me.userId && <span className="text-caption"> (siz)</span>}
                    </span>
                    <span className="block text-small">
                      {user?.email ?? "—"} · əlavə olunub {formatDateTime(row.created_at)}
                      {pendingInvite && " · dəvət gözləyir"}
                    </span>
                  </span>
                  {row.user_id !== me.userId && <RemoveAdminButton userId={row.user_id} name={row.name} />}
                </li>
              );
            })}
          </ul>
        </section>
        <section aria-labelledby="invite-title" className="rounded-card border border-border bg-surface p-5">
          <h2 id="invite-title" className="mb-4 font-medium text-ink-strong">Yeni admin dəvət et</h2>
          <InviteAdminForm />
        </section>
      </div>
    </div>
  );
}
