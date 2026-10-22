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
import { createCatalogMethods } from "./catalog-core";
import type { CatalogRepository } from "./repository";

export const localRepository: CatalogRepository = {
  ...createCatalogMethods(async () => ({ categories, products })),

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
