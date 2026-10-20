import type { ImageKey } from "@/config/images";
import type { Localized, World } from "@/lib/types";
import { L } from "./_helpers";

/** Ana səhifə üçün redaktə olunan məzmun (mətnlərin özü messages/*.json-dadır) */

export const homeHero = {
  image: "heroPoolGarden" as ImageKey,
  /** "Mövsümün məhsulu" kartı */
  featuredProductSlug: "trachycarpus-palma-1-8m",
  /** Reytinq blokundakı müştəri avatarları */
  avatars: ["avatar1", "avatar2", "avatar3", "avatar4"] as ImageKey[],
};

export interface WorldBanner {
  world: World;
  image: ImageKey;
  /** Əsas link (kateqoriya) */
  categorySlug: string;
  links: { label: Localized; categorySlug: string; subcategorySlug?: string }[];
}

/** "İki dünya" banneri — hovuz və bağ */
export const worldBanners: WorldBanner[] = [
  {
    world: "pool",
    image: "poolModern",
    categorySlug: "hovuz-ve-spa",
    links: [
      { label: L("Dərmanlar", "Химия", "Chemicals"), categorySlug: "hovuz-ve-spa", subcategorySlug: "hovuz-dermanlari" },
      { label: L("Filtrlər", "Фильтры", "Filters"), categorySlug: "hovuz-ve-spa", subcategorySlug: "filtrler" },
      { label: L("Robotlar", "Роботы", "Robots"), categorySlug: "hovuz-ve-spa", subcategorySlug: "robot-supurgeler" },
      { label: L("Su təmizləmə", "Очистка воды", "Water treatment"), categorySlug: "su-ve-enerji" },
    ],
  },
  {
    world: "garden",
    image: "lushGarden",
    categorySlug: "bitkiler-ve-agaclar",
    links: [
      { label: L("Bitkilər", "Растения", "Plants"), categorySlug: "bitkiler-ve-agaclar" },
      { label: L("Suvarma", "Полив", "Irrigation"), categorySlug: "suvarma" },
      { label: L("Gübrə", "Удобрения", "Fertiliser"), categorySlug: "torpaq-ve-gubre", subcategorySlug: "gubreler" },
      { label: L("Torpaq", "Грунт", "Soil"), categorySlug: "torpaq-ve-gubre", subcategorySlug: "torpaq-substrat" },
    ],
  },
];

/** Bestseller filtr düymələri: açar → kateqoriya slug-ları */
export const bestsellerFilters: { key: string; label: Localized; categories: string[] }[] = [
  { key: "pool", label: L("Hovuz", "Бассейн", "Pool"), categories: ["hovuz-ve-spa", "su-ve-enerji"] },
  { key: "plants", label: L("Bitkilər", "Растения", "Plants"), categories: ["bitkiler-ve-agaclar"] },
  { key: "irrigation", label: L("Suvarma", "Полив", "Irrigation"), categories: ["suvarma"] },
  { key: "fertiliser", label: L("Gübrə", "Удобрения", "Fertiliser"), categories: ["torpaq-ve-gubre"] },
];
