/**
 * /data kateqoriya və məhsullarını Supabase-ə köçürür (slug üzrə upsert — təkrar işlətmək təhlükəsizdir).
 * İşlətmək: `npm run seed`
 */
import { createClient } from "@supabase/supabase-js";
import { categories } from "../data/categories";
import { products } from "../data/products";
import { supabasePublicEnv, supabaseSecretKey } from "../lib/supabase/env";
import { categoryToRows, productToRow } from "../lib/supabase/mappers";

async function main() {
  const env = supabasePublicEnv();
  if (!env) throw new Error("NEXT_PUBLIC_SUPABASE_URL / _PUBLISHABLE_KEY yoxdur");
  const db = createClient(env.url, supabaseSecretKey(), { auth: { persistSession: false } });

  const rows = categories.map(categoryToRows);
  const cat = await db.from("categories").upsert(rows.map((r) => r.category), { onConflict: "slug" });
  if (cat.error) throw cat.error;

  const sub = await db
    .from("subcategories")
    .upsert(rows.flatMap((r) => r.subcategories), { onConflict: "category_slug,slug" });
  if (sub.error) throw sub.error;

  const prod = await db.from("products").upsert(products.map((p) => productToRow(p)), { onConflict: "slug" });
  if (prod.error) throw prod.error;

  const { count } = await db.from("products").select("*", { count: "exact", head: true });
  console.log(`Kateqoriya: ${rows.length}, məhsul: ${products.length} (bazada ${count})`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
