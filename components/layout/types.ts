import type { World } from "@/lib/types";

/** Header/footer üçün hazırlanmış (artıq tərcümə olunmuş) naviqasiya məlumatı */
export interface NavCategory {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  world: World;
  image: string;
  count: number;
  subcategories: { slug: string; name: string; recurring: boolean }[];
}

export interface NavCampaign {
  title: string;
  discountPercent: number;
  image: string;
}

export interface NavLink {
  href: string;
  label: string;
}
