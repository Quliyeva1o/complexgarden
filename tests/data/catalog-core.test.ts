import { describe, expect, it } from "vitest";
import { categories } from "@/data/categories";
import { products } from "@/data/products";
import { createCatalogMethods } from "@/lib/data/catalog-core";
import { localRepository } from "@/lib/data/local";
import type { Category, Product } from "@/lib/types";

describe("localRepository (characterization)", () => {
  it("returns only active categories, sorted by order", async () => {
    const list = await localRepository.getCategories();
    expect(list.every((c) => c.active)).toBe(true);
    expect(list.map((c) => c.order)).toEqual([...list.map((c) => c.order)].sort((a, b) => a - b));
  });

  it("counts products per active category", async () => {
    const counts = await localRepository.getProductCounts();
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    expect(total).toBe((await localRepository.getProducts()).length);
  });

  it("finds a product by slug and searches by name", async () => {
    const first = products[0];
    expect((await localRepository.getProduct(first.slug))?.slug).toBe(first.slug);
    const hits = await localRepository.searchProducts(first.name.az.slice(0, 5), "az");
    expect(hits.some((p) => p.slug === first.slug)).toBe(true);
  });
});

describe("createCatalogMethods", () => {
  const base = categories.find((c) => c.active && c.subcategories.length > 0)!;
  const sub = base.subcategories[0];
  const category: Category = { ...base, subcategories: [{ ...sub, active: false }] };
  const product = (slug: string, extra: Partial<Product> = {}): Product => ({
    ...products[0],
    slug,
    categorySlug: category.slug,
    subcategorySlug: undefined,
    ...extra,
  });
  const inactiveCategory: Category = { ...category, slug: "gizli", active: false };
  const methods = createCatalogMethods(async () => ({
    categories: [category, inactiveCategory],
    products: [
      product("gorunen"),
      product("gizli-alt", { subcategorySlug: sub.slug }),
      product("gizli-kat", { categorySlug: "gizli" }),
    ],
  }));

  it("hides products in inactive categories and inactive subcategories", async () => {
    expect((await methods.getProducts()).map((p) => p.slug)).toEqual(["gorunen"]);
  });

  it("does not return inactive categories", async () => {
    expect(await methods.getCategory("gizli")).toBeUndefined();
  });
});
