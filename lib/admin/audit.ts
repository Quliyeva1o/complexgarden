import "server-only";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireAdmin } from "./session";

type AuditEntity = "product" | "category" | "order" | "request" | "admin";

/** Tarixçəyə yazır (RLS: yalnız admin, yalnız öz adına). Uğursuzluq əsas əməliyyatı dayandırmır. */
export async function writeAudit(entry: { entity: AuditEntity; entityId: string; action: string; changes?: unknown }) {
  const me = await requireAdmin();
  const db = await createServerSupabase();
  const { error } = await db.from("audit_log").insert({
    user_id: me.userId,
    entity: entry.entity,
    entity_id: entry.entityId,
    action: entry.action,
    changes: entry.changes ?? null,
  });
  if (error) console.error("audit_log yazılmadı:", error.message);
}
