/**
 * E-poçtsuz şifrə təyin etmə linki yaradır (poçt limiti dolanda və ya poçt gəlməyəndə).
 * Link yalnız terminalda göstərilir — brauzerdə açın, şifrə təyin etmə səhifəsinə aparır.
 * İşlətmək: npm.cmd run admin:link -- ad@example.com
 */
import { createClient } from "@supabase/supabase-js";
import { supabasePublicEnv, supabaseSecretKey } from "../lib/supabase/env";

async function main() {
  const [email] = process.argv.slice(2);
  if (!email) throw new Error("İstifadə: npm run admin:link -- ad@example.com");
  const env = supabasePublicEnv();
  if (!env) throw new Error("Supabase env yoxdur");
  const db = createClient(env.url, supabaseSecretKey(), { auth: { persistSession: false } });

  const site = process.env.ADMIN_SITE_URL ?? "http://localhost:3000";
  const { data, error } = await db.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: `${site}/admin/auth/callback` },
  });
  if (error) throw error;

  console.log("\nBu linki brauzerdə açın (bir dəfəlik, tezliklə vaxtı keçir):\n");
  console.log(data.properties.action_link);
  console.log("\nLinki heç kimlə paylaşmayın — hesabınıza giriş verir.\n");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
