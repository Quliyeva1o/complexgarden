/**
 * /data fayllarının bütövlüyünü yoxlayır: slug formatı və təkrarlar, çarpaz istinadlar,
 * alt kateqoriyalar, aktiv bölmələrdə məhsul sayı. İşlətmək: `npm run validate:data`
 */
import { articles } from "../data/articles";
import { campaigns } from "../data/campaigns";
import { categories } from "../data/categories";
import { products } from "../data/products";
import { projects } from "../data/projects";
import { plantRegions } from "../data/regions";
import { seasonal } from "../data/seasonal";
import { services } from "../data/services";
import { subscriptionPlans } from "../data/subscriptions";

const errors: string[] = [];
const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const productSlugs = new Set(products.map((p) => p.slug));
const projectSlugs = new Set(projects.map((p) => p.slug));

function checkSlugs(kind: string, slugs: string[]) {
  const seen = new Set<string>();
  for (const slug of slugs) {
    if (!slugPattern.test(slug)) errors.push(`${kind}: yanlış slug formatı "${slug}"`);
    if (seen.has(slug)) errors.push(`${kind}: təkrar slug "${slug}"`);
    seen.add(slug);
  }
}

function checkRefs(owner: string, refs: string[]) {
  for (const ref of refs) {
    if (!productSlugs.has(ref)) errors.push(`${owner}: mövcud olmayan məhsul "${ref}"`);
  }
}

checkSlugs("category", categories.map((c) => c.slug));
checkSlugs("subcategory", categories.flatMap((c) => c.subcategories.map((s) => `${s.slug}`)));
checkSlugs("product", products.map((p) => p.slug));
checkSlugs("service", services.map((s) => s.slug));
checkSlugs("subscription", subscriptionPlans.map((s) => s.slug));
checkSlugs("project", projects.map((p) => p.slug));
checkSlugs("campaign", campaigns.map((c) => c.slug));
checkSlugs("article", articles.map((a) => a.slug));

for (const p of products) {
  const category = categories.find((c) => c.slug === p.categorySlug);
  if (!category) {
    errors.push(`product ${p.slug}: kateqoriya yoxdur "${p.categorySlug}"`);
    continue;
  }
  if (p.subcategorySlug && !category.subcategories.some((s) => s.slug === p.subcategorySlug)) {
    errors.push(`product ${p.slug}: alt kateqoriya yoxdur "${p.subcategorySlug}"`);
  }
  if (p.oldPrice !== undefined && p.oldPrice <= p.price) {
    errors.push(`product ${p.slug}: oldPrice qiymətdən böyük olmalıdır`);
  }
  if (p.productType === "plant" && !p.plantPassport) errors.push(`product ${p.slug}: plantPassport yoxdur`);
  if (p.productType === "chemical" && !p.dosage) errors.push(`product ${p.slug}: dosage yoxdur`);
  if (p.subscriptionEligible !== Boolean(p.badges?.includes("subscription"))) {
    errors.push(`product ${p.slug}: subscriptionEligible və "subscription" nişanı uyğun gəlmir`);
  }
  for (const region of p.plantPassport?.regions ?? []) {
    if (!(region in plantRegions)) errors.push(`product ${p.slug}: naməlum bölgə "${region}"`);
  }
  if (!p.inStock && !p.leadTimeDays) errors.push(`product ${p.slug}: stokda yoxdursa leadTimeDays lazımdır`);
  checkRefs(`product ${p.slug} boughtTogether`, p.boughtTogether ?? []);
}

for (const c of categories.filter((c) => c.active)) {
  const count = products.filter((p) => p.categorySlug === c.slug).length;
  if (count < 6 || count > 8) errors.push(`category ${c.slug}: ${count} məhsul (6–8 gözlənilir)`);
}

for (const m of seasonal) m.tips.forEach((tip, i) => checkRefs(`seasonal ${m.month}.${i}`, tip.productSlugs));
if (new Set(seasonal.map((m) => m.month)).size !== 12) errors.push("seasonal: 12 ay olmalıdır");
for (const c of campaigns) checkRefs(`campaign ${c.slug}`, c.productSlugs);
for (const a of articles) checkRefs(`article ${a.slug}`, a.productSlugs);
for (const s of services) {
  for (const ref of s.projectSlugs) {
    if (!projectSlugs.has(ref)) errors.push(`service ${s.slug}: mövcud olmayan layihə "${ref}"`);
  }
}

if (errors.length) {
  console.error(`✗ ${errors.length} xəta:\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log(
  `✓ Məlumat düzgündür: ${categories.length} kateqoriya (${categories.filter((c) => c.active).length} aktiv), ` +
    `${products.length} məhsul, ${subscriptionPlans.length} abunə, ${services.length} xidmət, ` +
    `${seasonal.length} ay, ${projects.length} layihə, ${campaigns.length} kampaniya, ${articles.length} məqalə`,
);
