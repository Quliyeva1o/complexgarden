import type { Locale } from "@/i18n/routing";
import type {
  Article,
  Campaign,
  Category,
  Localized,
  Product,
  Project,
  Review,
  SeasonalMonth,
  Service,
  SubscriptionPlan,
} from "@/lib/types";
import type { ProductQuery } from "./query";

/**
 * Məlumat qatının müqaviləsi. Hazırda `/data` fayllarından oxuyan lokal implementasiya var
 * (`local.ts`). Supabase və ya headless e-commerce (Medusa / Shopify) qoşmaq üçün
 * bu interfeysi həyata keçirən yeni modul yazıb `index.ts`-də dəyişmək kifayətdir.
 * Bütün metodlar asinxrondur ki, uzaq API-yə keçid komponentlərə toxunmasın.
 */
export interface CatalogRepository {
  // Kateqoriyalar
  getCategories(options?: { includeInactive?: boolean }): Promise<Category[]>;
  getCategory(slug: string): Promise<Category | undefined>;

  // Məhsullar
  getProducts(query?: ProductQuery): Promise<Product[]>;
  getProduct(slug: string): Promise<Product | undefined>;
  getProductsBySlugs(slugs: string[]): Promise<Product[]>;
  getBestsellers(limit?: number): Promise<Product[]>;
  getRelatedProducts(product: Product, limit?: number): Promise<Product[]>;
  searchProducts(term: string, locale: Locale, limit?: number): Promise<Product[]>;
  /** Kateqoriyada mövcud brendlər (filtr paneli üçün) */
  getBrands(categorySlug?: string): Promise<string[]>;
  /** Aktiv kateqoriya üzrə məhsul sayı */
  getProductCounts(): Promise<Record<string, number>>;

  // Abunə, xidmət, məzmun
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getServices(): Promise<Service[]>;
  getService(slug: string): Promise<Service | undefined>;
  getSeasonalMonth(month: number): Promise<SeasonalMonth | undefined>;
  getProjects(): Promise<Project[]>;
  getReviews(): Promise<{ rating: number; count: number; items: Review[] }>;
  getCampaigns(): Promise<Campaign[]>;
  getArticles(): Promise<Article[]>;
  getArticle(slug: string): Promise<Article | undefined>;

  /** Bitki pasportundakı bölgə adları: açar → { az, ru, en } */
  getPlantRegions(): Promise<Record<string, Localized>>;

  // Məlumat səhifələri (haqqımızda, çatdırılma, qaytarma) və FAQ
  getInfoPage(slug: import("@/data/pages").InfoPage["slug"]): Promise<import("@/data/pages").InfoPage | undefined>;
  getFaq(): Promise<import("@/data/pages").FaqGroup[]>;

  // Ana səhifə məzmunu (hero, iki dünya banneri, bestseller filtrləri)
  getHomeContent(): Promise<HomeContent>;
}

export interface HomeContent {
  hero: typeof import("@/data/home").homeHero;
  worlds: import("@/data/home").WorldBanner[];
  bestsellerFilters: typeof import("@/data/home").bestsellerFilters;
}
