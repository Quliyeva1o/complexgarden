import { NextResponse, type NextRequest } from "next/server";
import { hasLocale } from "next-intl";
import { img } from "@/config/images";
import { routing } from "@/i18n/routing";
import { catalog } from "@/lib/data";
import { localize } from "@/lib/utils";

export type SearchResponse = {
  products: { slug: string; name: string; price: number; image: string; category: string }[];
  categories: { slug: string; name: string }[];
};

const normalize = (value: string) =>
  value.toLocaleLowerCase("az").normalize("NFD").replace(/\p{Diacritic}/gu, "");

/** Header axtarışının təklifləri: GET /api/search?q=xlor&locale=az */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const param = request.nextUrl.searchParams.get("locale") ?? "";
  const locale = hasLocale(routing.locales, param) ? param : routing.defaultLocale;

  if (q.length < 2) {
    return NextResponse.json<SearchResponse>({ products: [], categories: [] });
  }

  const [products, categories] = await Promise.all([
    catalog.searchProducts(q, locale, 6),
    catalog.getCategories(),
  ]);
  const needle = normalize(q);

  const body: SearchResponse = {
    products: products.map((p) => ({
      slug: p.slug,
      name: localize(p.name, locale),
      price: p.price,
      image: img(p.images[0]),
      category: localize(categories.find((c) => c.slug === p.categorySlug)?.shortName ?? p.name, locale),
    })),
    categories: categories
      .filter((c) => normalize(`${c.name[locale]} ${c.name.az}`).includes(needle))
      .slice(0, 4)
      .map((c) => ({ slug: c.slug, name: localize(c.name, locale) })),
  };

  return NextResponse.json(body);
}
