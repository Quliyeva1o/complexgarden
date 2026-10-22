import { describe, expect, it } from "vitest";
import { categories } from "@/data/categories";
import { products } from "@/data/products";
import { img } from "@/config/images";
import { categoryToRows, productToRow, rowToCategory, rowToProduct } from "@/lib/supabase/mappers";

describe("product mapping", () => {
  it("round-trips every demo product (images become absolute URLs)", () => {
    for (const p of products) {
      const back = rowToProduct(productToRow(p));
      expect(back).toEqual({ ...p, images: p.images.map((i) => img(i)) });
    }
  });

  it("defaults to published status", () => {
    expect(productToRow(products[0]).status).toBe("published");
    expect(productToRow(products[0], "draft").status).toBe("draft");
  });

  it("stores missing optionals as null / empty arrays", () => {
    const { oldPrice: _o, brand: _b, boughtTogether: _bt, ...rest } = products[0];
    const row = productToRow({ ...rest });
    expect(row.old_price).toBeNull();
    expect(row.brand).toBeNull();
    expect(row.bought_together).toEqual([]);
  });

  it("coerces numeric strings from Postgres into numbers", () => {
    const row = { ...productToRow(products[0]), price: "89.00" as unknown as number };
    expect(rowToProduct(row).price).toBe(89);
  });
});

describe("category mapping", () => {
  it("round-trips every demo category (filters come from code)", () => {
    for (const c of categories) {
      const { category, subcategories } = categoryToRows(c);
      expect(rowToCategory(category, subcategories, c.filters)).toEqual({ ...c, image: img(c.image) });
    }
  });

  it("orders subcategories by sort_order and only takes its own", () => {
    const c = categories.find((x) => x.subcategories.length > 1)!;
    const { category, subcategories } = categoryToRows(c);
    const foreign = { ...subcategories[0], category_slug: "basqa" };
    const shuffled = [foreign, ...[...subcategories].reverse()];
    expect(rowToCategory(category, shuffled, []).subcategories.map((s) => s.slug)).toEqual(
      c.subcategories.map((s) => s.slug),
    );
  });
});
