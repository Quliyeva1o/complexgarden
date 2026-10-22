import type {
  Dosage,
  Localized,
  PlantPassport,
  ProductBadge,
  ProductType,
  World,
} from "@/lib/types";

/** Bazadakı sətirlərin forması — supabase/migrations/20261022000000_init.sql ilə eyni */

export type ProductStatus = "draft" | "published" | "archived";

export interface CategoryRow {
  slug: string;
  name: Localized;
  short_name: Localized | null;
  description: Localized;
  guide: Localized | null;
  faq: { question: Localized; answer: Localized }[];
  world: World;
  image: string;
  active: boolean;
  sort_order: number;
}

export interface SubcategoryRow {
  category_slug: string;
  slug: string;
  name: Localized;
  recurring: boolean;
  active: boolean;
  sort_order: number;
}

export interface ProductRow {
  slug: string;
  status: ProductStatus;
  name: Localized;
  description: Localized;
  category_slug: string;
  subcategory_slug: string | null;
  product_type: ProductType;
  price: number;
  old_price: number | null;
  in_stock: boolean;
  lead_time_days: number | null;
  subscription_eligible: boolean;
  brand: string | null;
  badges: ProductBadge[];
  images: string[];
  specs: { label: Localized; value: string | Localized }[];
  plant_passport: PlantPassport | null;
  dosage: Dosage | null;
  installation_service: { available: boolean; price: number } | null;
  attributes: Record<string, string | number | boolean> | null;
  warranty_months: number | null;
  bought_together: string[];
  rating: number | null;
  reviews_count: number | null;
  popularity: number | null;
  created_at: string;
}
