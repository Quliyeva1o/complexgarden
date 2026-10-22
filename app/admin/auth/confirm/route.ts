import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { ADMIN_LOGIN, ADMIN_SET_PASSWORD } from "@/lib/admin/paths";
import { createServerSupabase } from "@/lib/supabase/server";

const ALLOWED: EmailOtpType[] = ["invite", "recovery"];

/** Dəvət və şifrə bərpası e-poçtundakı link: token-i yoxlayır, sessiya açır, şifrə səhifəsinə aparır */
export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;

  if (tokenHash && type && ALLOWED.includes(type)) {
    const db = await createServerSupabase();
    const { error } = await db.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) redirect(ADMIN_SET_PASSWORD);
  }
  redirect(`${ADMIN_LOGIN}?xeta=link`);
}
