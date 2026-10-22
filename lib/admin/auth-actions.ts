"use server";

import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { ADMIN_HOME, ADMIN_LOGIN, safeNextPath } from "./paths";
import { getAdminSession, requireAdmin } from "./session";
import {
  fieldErrors,
  loginSchema,
  resetRequestSchema,
  setPasswordSchema,
  type FormState,
} from "./validation";

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { status: "error", errors: fieldErrors(parsed.error) };

  const db = await createServerSupabase();
  const { error } = await db.auth.signInWithPassword(parsed.data);
  if (error) return { status: "error", message: "E-poçt və ya şifrə yanlışdır" };

  if (!(await getAdminSession())) {
    await db.auth.signOut();
    return { status: "error", message: "Bu hesabın admin panelə girişi yoxdur" };
  }
  redirect(safeNextPath(String(formData.get("next") ?? "")));
}

export async function signOut(): Promise<void> {
  const db = await createServerSupabase();
  await db.auth.signOut();
  redirect(ADMIN_LOGIN);
}

export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = resetRequestSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { status: "error", errors: fieldErrors(parsed.error) };

  const db = await createServerSupabase();
  // Link e-poçt şablonundadır: {{ .SiteURL }}/admin/auth/confirm?token_hash=…&type=recovery
  await db.auth.resetPasswordForEmail(parsed.data.email);
  // E-poçtun mövcudluğunu bildirmirik
  return {
    status: "success",
    message: "Bu e-poçt admin hesabına aiddirsə, şifrə bərpa linki göndərildi. Poçtunuzu yoxlayın.",
  };
}

export async function updatePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = setPasswordSchema.safeParse({ password: formData.get("password"), confirm: formData.get("confirm") });
  if (!parsed.success) return { status: "error", errors: fieldErrors(parsed.error) };

  const db = await createServerSupabase();
  const { error } = await db.auth.updateUser({ password: parsed.data.password });
  if (error) return { status: "error", message: `Şifrəni yeniləmək olmadı: ${error.message}` };
  redirect(ADMIN_HOME);
}
