import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabasePublicEnv } from "./env";

/** Cookie-siz anonim klient — "use cache" daxilində ictimai oxumalar üçün */
export function createPublicClient(): SupabaseClient {
  const env = supabasePublicEnv();
  if (!env) throw new Error("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY təyin olunmayıb");
  return createClient(env.url, env.key, { auth: { persistSession: false, autoRefreshToken: false } });
}
