import { articles } from "@/data/articles";
import { campaigns } from "@/data/campaigns";
import { categories } from "@/data/categories";
import { bestsellerFilters, homeHero, worldBanners } from "@/data/home";
import { products } from "@/data/products";
import { projects } from "@/data/projects";
import { faqGroups, infoPages } from "@/data/pages";
import { plantRegions } from "@/data/regions";
import { reviewSummary, reviews } from "@/data/reviews";
import { seasonal } from "@/data/seasonal";
import { services } from "@/data/services";
import { subscriptionPlans } from "@/data/subscriptions";
import type { Product } from "@/lib/types";
import { applyProductQuery, sortProducts } from "./query";
import type { CatalogRepository } from "./repository";

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;

/** Yalnız aktiv kateqoriya və aktiv alt kateqoriyadakı məhsullar satışdadır */
function visibleProducts(): Product[] {
  const active = new Map(categories.filter((c) => c.active).map((c) => [c.slug, c]));
  return products.filter((p) => {
    const category = active.get(p.categorySlug);
    if (!category) return false;
    if (!p.subcategorySlug) return true;
    const sub = category.subcategories.find((s) => s.slug === p.subcategorySlug);
    return sub?.active !== false;
  });
}

function normalize(value: string): string {
  return value.toLocaleLowerCase("az").normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

export const localRepository: CatalogRepository = {
  async getCategories(options) {
    const list = options?.includeInactive ? categories : categories.filter((c) => c.active);
    return [...list].sort(byOrder);
  },

  async getCategory(slug) {
    return categories.find((c) => c.slug === slug && c.active);
  },

  async getProducts(query = {}) {
    const category = query.categorySlug
      ? categories.find((c) => c.slug === query.categorySlug)
      : undefined;
    return applyProductQuery(visibleProducts(), query, category);
  },

  async getProduct(slug) {
    return visibleProducts().find((p) => p.slug === slug);
  },

  async getProductsBySlugs(slugs) {
    const list = visibleProducts();
    return slugs
      .map((slug) => list.find((p) => p.slug === slug))
      .filter((p): p is Product => Boolean(p));
  },

  async getBestsellers(limit = 8) {
    const list = visibleProducts().filter((p) => p.badges?.includes("bestseller"));
    return sortProducts(list, "popular").slice(0, limit);
  },

  async getRelatedProducts(product, limit = 4) {
    const list = visibleProducts().filter(
      (p) => p.slug !== product.slug && p.categorySlug === product.categorySlug,
    );
    // Eyni alt kateqoriya əvvəl gəlsin
    const ranked = sortProducts(list, "popular").sort(
      (a, b) =>
        Number(b.subcategorySlug === product.subcategorySlug) -
        Number(a.subcategorySlug === product.subcategorySlug),
    );
    return ranked.slice(0, limit);
  },

  async searchProducts(term, locale, limit = 8) {
    const needle = normalize(term.trim());
    if (!needle) return [];
    const hits = visibleProducts().filter((p) => {
      const haystack = normalize(`${p.name[locale]} ${p.name.az} ${p.brand ?? ""}`);
      return haystack.includes(needle);
    });
    return sortProducts(hits, "popular").slice(0, limit);
  },

  async getBrands(categorySlug) {
    const brands = visibleProducts()
      .filter((p) => !categorySlug || p.categorySlug === categorySlug)
      .map((p) => p.brand)
      .filter((b): b is string => Boolean(b));
    return [...new Set(brands)].sort();
  },

  async getProductCounts() {
    const counts: Record<string, number> = {};
    for (const p of visibleProducts()) {
      counts[p.categorySlug] = (counts[p.categorySlug] ?? 0) + 1;
    }
    return counts;
  },

  async getSubscriptionPlans() {
    return subscriptionPlans;
  },

  async getServices() {
    return services;
  },

  async getService(slug) {
    return services.find((s) => s.slug === slug);
  },

  async getSeasonalMonth(month) {
    return seasonal.find((m) => m.month === month);
  },

  async getProjects() {
    return projects;
  },

  async getReviews() {
    return { ...reviewSummary, items: reviews };
  },

  async getCampaigns() {
    return campaigns;
  },

  async getArticles() {
    return [...articles].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  },

  async getArticle(slug) {
    return articles.find((a) => a.slug === slug);
  },

  async getInfoPage(slug) {
    return infoPages.find((p) => p.slug === slug);
  },

  async getFaq() {
    return faqGroups;
  },

  async getPlantRegions() {
    return plantRegions;
  },

  async getHomeContent() {
    return { hero: homeHero, worlds: worldBanners, bestsellerFilters };
  },
};
