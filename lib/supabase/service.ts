import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabasePublicEnv, supabaseSecretKey } from "./env";

/** RLS-i keçən klient — yalnız serverdə, yoxlamadan sonra (sifariş yazmaq, admin dəvəti) */
export function createServiceClient(): SupabaseClient {
  const env = supabasePublicEnv();
  if (!env) throw new Error("NEXT_PUBLIC_SUPABASE_URL təyin olunmayıb");
  return createClient(env.url, supabaseSecretKey(), { auth: { persistSession: false, autoRefreshToken: false } });
}
