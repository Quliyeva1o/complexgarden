/**
 * İlk admini dəvət edir (və ya mövcud istifadəçini admin edir).
 * İşlətmək: npm.cmd run admin:invite -- ad@example.com "Ad Soyad"
 */
import { createClient } from "@supabase/supabase-js";
import { supabasePublicEnv, supabaseSecretKey } from "../lib/supabase/env";

async function main() {
  const [email, name = ""] = process.argv.slice(2);
  if (!email) throw new Error('İstifadə: npm run admin:invite -- ad@example.com "Ad Soyad"');
  const env = supabasePublicEnv();
  if (!env) throw new Error("Supabase env yoxdur");
  const db = createClient(env.url, supabaseSecretKey(), { auth: { persistSession: false } });

  let userId: string | undefined;
  // Dəvət linki saytın /admin/auth/callback səhifəsinə qayıdır (yayımda ADMIN_SITE_URL=https://domen)
  const site = process.env.ADMIN_SITE_URL ?? "http://localhost:3000";
  const invited = await db.auth.admin.inviteUserByEmail(email, {
    data: { name },
    redirectTo: `${site}/admin/auth/callback`,
  });
  if (invited.error) {
    const { data } = await db.auth.admin.listUsers({ perPage: 200 });
    userId = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())?.id;
    if (!userId) throw invited.error;
    console.log("İstifadəçi artıq var — admin hüququ verilir");
  } else {
    userId = invited.data.user.id;
    console.log(`Dəvət e-poçtu göndərildi: ${email}`);
  }

  const res = await db.from("admins").upsert({ user_id: userId, name: name || email }, { onConflict: "user_id" });
  if (res.error) throw res.error;
  console.log("Admin siyahısına əlavə olundu");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
