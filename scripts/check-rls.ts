/**
 * Təhlükəsizlik yoxlaması: anonim istifadəçi yalnız dərc olunmuşu oxuyur, heç yerə yaza bilmir.
 * İşlətmək: `npm run check:rls` (exit code 1 = problem)
 */
import { createClient } from "@supabase/supabase-js";
import { products } from "../data/products";
import { supabasePublicEnv, supabaseSecretKey } from "../lib/supabase/env";
import { productToRow } from "../lib/supabase/mappers";

const env = supabasePublicEnv();
if (!env) throw new Error("Supabase env yoxdur");
const anon = createClient(env.url, env.key, { auth: { persistSession: false } });
const service = createClient(env.url, supabaseSecretKey(), { auth: { persistSession: false } });

const failures: string[] = [];
const expect = (ok: boolean, message: string) => {
  console.log(`${ok ? "✓" : "✗"} ${message}`);
  if (!ok) failures.push(message);
};

async function main() {
  const draftSlug = "rls-yoxlama-qaralama";
  const draft = await service
    .from("products")
    .upsert({ ...productToRow(products[0], "draft"), slug: draftSlug }, { onConflict: "slug" });
  if (draft.error) throw draft.error;

  try {
    const published = await anon.from("products").select("slug, status");
    expect(!published.error && (published.data?.length ?? 0) > 0, "anon dərc olunmuş məhsulları oxuyur");
    expect(published.data?.every((p) => p.status === "published") ?? false, "anon qaralamaları görmür");

    const insertProduct = await anon.from("products").insert({ ...productToRow(products[0]), slug: "rls-hack" });
    expect(insertProduct.error !== null, "anon məhsul əlavə edə bilmir");

    const update = await anon.from("products").update({ price: 1 }).eq("slug", products[0].slug).select();
    expect((update.data?.length ?? 0) === 0, "anon qiyməti dəyişə bilmir");

    const order = await anon.from("orders").insert({
      id: "261022-TEST",
      locale: "az",
      customer: {},
      items: [{}],
      subtotal: 1,
      total: 1,
    });
    expect(order.error !== null, "anon sifarişi birbaşa yaza bilmir");

    const readOrders = await anon.from("orders").select("id");
    expect((readOrders.data?.length ?? 0) === 0, "anon sifarişləri oxuya bilmir");

    const admins = await anon.from("admins").select("user_id");
    expect((admins.data?.length ?? 0) === 0, "anon adminləri görmür");

    const upload = await anon.storage.from("product-images").upload("rls-test.txt", new Blob(["x"]), {
      contentType: "image/png",
    });
    expect(upload.error !== null, "anon şəkil yükləyə bilmir");
  } finally {
    await service.from("products").delete().eq("slug", draftSlug);
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length} yoxlama uğursuz oldu`);
    process.exit(1);
  }
  console.log("\nBütün təhlükəsizlik yoxlamaları keçdi");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
