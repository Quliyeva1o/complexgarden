import { img } from "@/config/images";
import type { Category, FilterDefinition, Product, Subcategory } from "@/lib/types";
import type { CategoryRow, ProductRow, ProductStatus, SubcategoryRow } from "./rows";

/** Postgres `numeric` bəzən string kimi gəlir */
const num = (v: number | string): number => (typeof v === "number" ? v : Number(v));
const optNum = (v: number | string | null): number | undefined => (v === null ? undefined : num(v));
const opt = <T>(v: T | null): T | undefined => (v === null ? undefined : v);

export function rowToCategory(row: CategoryRow, subs: SubcategoryRow[], filters: FilterDefinition[]): Category {
  const subcategories: Subcategory[] = subs
    .filter((s) => s.category_slug === row.slug)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((s) => ({
      slug: s.slug,
      name: s.name,
      ...(s.recurring && { recurring: true }),
      ...(!s.active && { active: false }),
    }));

  return {
    slug: row.slug,
    name: row.name,
    ...(row.short_name && { shortName: row.short_name }),
    description: row.description,
    world: row.world,
    active: row.active,
    image: row.image,
    subcategories,
    filters,
    order: row.sort_order,
    ...(row.guide && { guide: row.guide }),
    ...(row.faq.length > 0 && { faq: row.faq }),
  };
}

export function categoryToRows(c: Category): { category: CategoryRow; subcategories: SubcategoryRow[] } {
  return {
    category: {
      slug: c.slug,
      name: c.name,
      short_name: c.shortName ?? null,
      description: c.description,
      guide: c.guide ?? null,
      faq: c.faq ?? [],
      world: c.world,
      image: img(c.image),
      active: c.active,
      sort_order: c.order,
    },
    subcategories: c.subcategories.map((s, index) => ({
      category_slug: c.slug,
      slug: s.slug,
      name: s.name,
      recurring: s.recurring ?? false,
      active: s.active ?? true,
      sort_order: index,
    })),
  };
}

export function rowToProduct(row: ProductRow): Product {
  const product: Product = {
    slug: row.slug,
    name: row.name,
    categorySlug: row.category_slug,
    subcategorySlug: opt(row.subcategory_slug),
    productType: row.product_type,
    price: num(row.price),
    oldPrice: optNum(row.old_price),
    images: row.images,
    badges: row.badges.length > 0 ? row.badges : undefined,
    inStock: row.in_stock,
    leadTimeDays: opt(row.lead_time_days),
    subscriptionEligible: row.subscription_eligible,
    brand: opt(row.brand),
    description: row.description,
    specs: row.specs,
    plantPassport: opt(row.plant_passport),
    dosage: opt(row.dosage),
    installationService: opt(row.installation_service),
    warrantyMonths: opt(row.warranty_months),
    attributes: opt(row.attributes),
    boughtTogether: row.bought_together.length > 0 ? row.bought_together : undefined,
    rating: optNum(row.rating),
    reviewsCount: opt(row.reviews_count),
    popularity: opt(row.popularity),
    createdAt: row.created_at.slice(0, 10),
  };
  // Boş sahələri çıxar ki, obyekt fayldakı ilə eyni formada olsun
  return Object.fromEntries(Object.entries(product).filter(([, v]) => v !== undefined)) as Product;
}

export function productToRow(p: Product, status: ProductStatus = "published"): ProductRow {
  return {
    slug: p.slug,
    status,
    name: p.name,
    description: p.description,
    category_slug: p.categorySlug,
    subcategory_slug: p.subcategorySlug ?? null,
    product_type: p.productType,
    price: p.price,
    old_price: p.oldPrice ?? null,
    in_stock: p.inStock,
    lead_time_days: p.leadTimeDays ?? null,
    subscription_eligible: p.subscriptionEligible,
    brand: p.brand ?? null,
    badges: p.badges ?? [],
    images: p.images.map((i) => img(i)),
    specs: p.specs,
    plant_passport: p.plantPassport ?? null,
    dosage: p.dosage ?? null,
    installation_service: p.installationService ?? null,
    attributes: p.attributes ?? null,
    warranty_months: p.warrantyMonths ?? null,
    bought_together: p.boughtTogether ?? [],
    rating: p.rating ?? null,
    reviews_count: p.reviewsCount ?? null,
    popularity: p.popularity ?? null,
    created_at: p.createdAt,
  };
}
