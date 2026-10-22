"use server";

import { refresh } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { writeAudit } from "./audit";
import { requestOrigin } from "./origin";
import { ADMIN_AUTH_CALLBACK } from "./paths";
import { requireAdmin } from "./session";
import { fieldErrors, inviteSchema, type FormState } from "./validation";

export async function inviteAdmin(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = inviteSchema.safeParse({ name: formData.get("name"), email: formData.get("email") });
  if (!parsed.success) return { status: "error", errors: fieldErrors(parsed.error) };
  const { name, email } = parsed.data;

  const service = createServiceClient();
  const invited = await service.auth.admin.inviteUserByEmail(email, {
    data: { name },
    redirectTo: `${await requestOrigin()}${ADMIN_AUTH_CALLBACK}`,
  });
  if (invited.error) {
    const exists = /already|registered|exists/i.test(invited.error.message);
    return {
      status: "error",
      message: exists ? "Bu e-poçtla hesab artıq var" : `Dəvət göndərilmədi: ${invited.error.message}`,
    };
  }

  const userId = invited.data.user.id;
  const insert = await service.from("admins").upsert({ user_id: userId, name }, { onConflict: "user_id" });
  if (insert.error) return { status: "error", message: `Admin siyahısına əlavə olunmadı: ${insert.error.message}` };

  await writeAudit({ entity: "admin", entityId: userId, action: "invite", changes: { email, name } });
  refresh();
  return { status: "success", message: `${email} ünvanına dəvət göndərildi` };
}

export async function removeAdmin(userId: string): Promise<FormState> {
  const me = await requireAdmin();
  if (userId === me.userId) return { status: "error", message: "Özünüzü silə bilməzsiniz" };

  const service = createServiceClient();
  const { count } = await service.from("admins").select("user_id", { count: "exact", head: true });
  if ((count ?? 0) <= 1) return { status: "error", message: "Sonuncu admini silmək olmaz" };

  const removed = await service.from("admins").delete().eq("user_id", userId);
  if (removed.error) return { status: "error", message: `Silinmədi: ${removed.error.message}` };

  await writeAudit({ entity: "admin", entityId: userId, action: "remove" });
  refresh();
  return { status: "success", message: "Admin hüququ götürüldü" };
}
