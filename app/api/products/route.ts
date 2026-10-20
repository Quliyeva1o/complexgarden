import { NextResponse, type NextRequest } from "next/server";
import { hasLocale } from "next-intl";
import { img } from "@/config/images";
import { routing } from "@/i18n/routing";
import type { CartProduct } from "@/lib/cart/pricing";
import { catalog } from "@/lib/data";
import { localize } from "@/lib/utils";

/**
 * Səbət və checkout üçün məhsul məlumatı: GET /api/products?slugs=a,b&locale=az
 * Səbət localStorage-da yalnız slug və seçimləri saxlayır — qiymət həmişə buradan (aktual) gəlir.
 */
export async function GET(request: NextRequest) {
  const slugs = (request.nextUrl.searchParams.get("slugs") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 100);
  const param = request.nextUrl.searchParams.get("locale") ?? "";
  const locale = hasLocale(routing.locales, param) ? param : routing.defaultLocale;

  const [products, categories] = await Promise.all([catalog.getProductsBySlugs(slugs), catalog.getCategories()]);

  const body: CartProduct[] = products.map((p) => {
    const category = categories.find((c) => c.slug === p.categorySlug);
    return {
      slug: p.slug,
      name: localize(p.name, locale),
      image: img(p.images[0]),
      category: category ? localize(category.shortName ?? category.name, locale) : "",
      world: category?.world ?? "garden",
      price: p.price,
      inStock: p.inStock,
      leadTimeDays: p.leadTimeDays,
      subscriptionEligible: p.subscriptionEligible,
      ...(p.installationService?.available && {
        service: { kind: p.productType === "plant" ? "planting" : "install", price: p.installationService.price },
      }),
    };
  });

  return NextResponse.json(body);
}
