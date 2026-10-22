import "server-only";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { supabasePublicEnv } from "./env";

/**
 * Sessiyalı klient (admin). cookies() oxuyur — yalnız <Suspense> daxilində,
 * Server Action və ya Route Handler-də çağırın.
 */
export async function createServerSupabase(): Promise<SupabaseClient> {
  const env = supabasePublicEnv();
  if (!env) throw new Error("NEXT_PUBLIC_SUPABASE_URL / _PUBLISHABLE_KEY təyin olunmayıb");
  // Sessiya hər sorğuda oxunur; Supabase klienti daxildə Date.now() istifadə edir — prerender olunmamalıdır
  await connection();
  const store = await cookies();
  return createServerClient(env.url, env.key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(list) {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Server Component-dən çağırılıb — sessiyanı proxy yeniləyir
        }
      },
    },
  });
}
