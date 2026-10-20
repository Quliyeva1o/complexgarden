/**
 * Saytın bütün yolları bir yerdə — linklər komponentlərdə əl ilə yazılmır.
 * Yollar dil prefiksi olmadan verilir; `@/i18n/navigation` Link-i prefiksi özü əlavə edir.
 */
export const routes = {
  home: "/",
  category: (slug: string, sub?: string) => (sub ? `/kateqoriya/${slug}?alt=${sub}` : `/kateqoriya/${slug}`),
  product: (slug: string) => `/mehsul/${slug}`,
  search: (q?: string) => (q ? `/axtaris?q=${encodeURIComponent(q)}` : "/axtaris"),
  services: "/xidmetler",
  service: (slug: string) => `/xidmetler/${slug}`,
  subscriptions: "/abune",
  campaigns: "/kampaniyalar",
  cart: "/sebet",
  checkout: "/sifaris",
  favorites: "/secilmisler",
  account: "/hesab",
  guides: "/beledciler",
  guide: (slug: string) => `/beledciler/${slug}`,
  about: "/haqqimizda",
  delivery: "/catdirilma",
  returns: "/qaytarma-ve-zemanet",
  faq: "/faq",
  contact: "/elaqe",
} as const;
