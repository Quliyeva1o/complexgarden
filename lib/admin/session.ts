import "server-only";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { ADMIN_LOGIN } from "./paths";

export interface AdminSession {
  userId: string;
  email: string;
  name: string;
}

/** Daxil olmuş və `admins` cədvəlində olan istifadəçi; əks halda null */
export async function getAdminSession(): Promise<AdminSession | null> {
  const db = await createServerSupabase();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return null;
  // RLS: admins cədvəlini yalnız adminlər oxuyur — sətir gəlmirsə, admin deyil
  const { data } = await db.from("admins").select("name").eq("user_id", user.id).maybeSingle();
  if (!data) return null;
  const email = user.email ?? "";
  return { userId: user.id, email, name: data.name || email };
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect(ADMIN_LOGIN);
  return session;
}
