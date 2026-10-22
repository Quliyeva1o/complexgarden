import { afterEach, describe, expect, it, vi } from "vitest";
import { images, img } from "@/config/images";

describe("img()", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("resolves a known image key", () => {
    expect(img("poolResort")).toBe(images.poolResort);
  });

  it("returns absolute URLs unchanged", () => {
    expect(img("https://cdn.example.com/a.jpg")).toBe("https://cdn.example.com/a.jpg");
  });

  it("turns a Storage path into a public Supabase URL", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abc.supabase.co");
    expect(img("products/xlor/1.webp")).toBe(
      "https://abc.supabase.co/storage/v1/object/public/product-images/products/xlor/1.webp",
    );
  });

  it("strips a leading slash from Storage paths", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abc.supabase.co");
    expect(img("/p/1.webp")).toBe("https://abc.supabase.co/storage/v1/object/public/product-images/p/1.webp");
  });
});
