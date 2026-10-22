import type { ImageKey, ImageRef } from "@/config/images";
import type { Locale } from "@/i18n/routing";

/** Hər dildə mətn: { az, ru, en } */
export type Localized = Record<Locale, string>;

export type World = "pool" | "garden";
export type ProductType = "chemical" | "plant" | "equipment" | "general";
export type ProductBadge = "sale" | "new" | "subscription" | "bestseller";

/* -------------------------------------------------------------------------- */
/* Filtrlər                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Kateqoriyaya xas filtr. `field` məhsulda dəyərin harada olduğunu göstərir:
 * - "attributes.<açar>"      → product.attributes[açar]
 * - "plantPassport.<açar>"   → product.plantPassport[açar]
 */
export type FilterField = `attributes.${string}` | `plantPassport.${string}`;

export type FilterDefinition =
  | {
      key: string;
      type: "options";
      field: FilterField;
      label: Localized;
      options: { value: string; label: Localized }[];
    }
  | {
      key: string;
      type: "range";
      field: FilterField;
      label: Localized;
      unit?: string;
      /** Hazır aralıqlar, məs. hündürlük üçün */
      buckets: { min?: number; max?: number; label: Localized }[];
    }
  | {
      key: string;
      type: "boolean";
      field: FilterField;
      label: Localized;
    };

/* -------------------------------------------------------------------------- */
/* Kateqoriya və məhsul                                                        */
/* -------------------------------------------------------------------------- */

export interface Subcategory {
  slug: string;
  name: Localized;
  /** Təkrar alınan (abunəyə uyğun) alt kateqoriya ♻️ */
  recurring?: boolean;
  /** false → menyuda gizlidir (default: true) */
  active?: boolean;
}

export interface Category {
  slug: string;
  name: Localized;
  /** Menyu və kartlar üçün qısa ad (ixtiyari) */
  shortName?: Localized;
  description: Localized;
  world: World;
  active: boolean;
  image: ImageRef;
  subcategories: Subcategory[];
  filters: FilterDefinition[];
  order: number;
  /** Kateqoriya bələdçisi (SEO mətni) — kateqoriya səhifəsinin altında */
  guide?: Localized;
  faq?: { question: Localized; answer: Localized }[];
}

export type Sun = "full" | "partial" | "shade";
export type Water = "low" | "medium" | "high";

export interface PlantPassport {
  heightCm: number;
  ageYears?: number;
  potSize?: string;
  sun: Sun;
  water: Water;
  frostHardinessC?: number;
  /** Bölgə açarları: "absheron" | "guba-khachmaz" | "lankaran" ... */
  regions: string[];
  evergreen?: boolean;
}

export interface Dosage {
  unit: "m3" | "m2";
  /** Bir vahid (m³ / m²) üçün tələb olunan miqdar, `packUnit` ilə eyni ölçüdə */
  amountPerUnit: number;
  /** Bir qablaşdırmadakı miqdar */
  packAmount: number;
  /** "g" | "kg" | "ml" | "L" | "tablet" */
  packUnit: string;
  /** Tətbiq tezliyi (gün) — qablaşdırmanın neçə həftə çatacağını hesablamaq üçün */
  intervalDays: number;
}

export interface Product {
  slug: string;
  name: Localized;
  categorySlug: string;
  subcategorySlug?: string;
  productType: ProductType;
  /** AZN */
  price: number;
  oldPrice?: number;
  images: ImageRef[];
  badges?: ProductBadge[];
  inStock: boolean;
  /** Sifarişlə gələn məhsullar üçün tədarük müddəti (gün) */
  leadTimeDays?: number;
  subscriptionEligible: boolean;
  brand?: string;
  description: Localized;
  /** Dəyər dildən asılı deyilsə string, mətndirsə Localized */
  specs: { label: Localized; value: string | Localized }[];
  plantPassport?: PlantPassport;
  dosage?: Dosage;
  installationService?: { available: boolean; price: number };
  /** Zəmanət (ay) — avadanlıq üçün */
  warrantyMonths?: number;
  /** Kateqoriyaya xas filtrlər üçün sahələr (məqsəd, həcm, sahə ölçüsü...) */
  attributes?: Record<string, string | number | boolean>;
  /** "Birlikdə alınır" bloku */
  boughtTogether?: string[];
  rating?: number;
  reviewsCount?: number;
  /** Populyarlıq sıralaması üçün (böyük = populyar) */
  popularity?: number;
  /** ISO tarix — "yeni" sıralaması üçün */
  createdAt: string;
}

/* -------------------------------------------------------------------------- */
/* Abunə, xidmət, məzmun                                                       */
/* -------------------------------------------------------------------------- */

export interface SubscriptionPlan {
  slug: string;
  name: Localized;
  description: Localized;
  world: World;
  /** AZN / ay */
  monthlyPrice: number;
  /** Ayrı-ayrılıqda alınsa qiymət — qənaət faizi buradan hesablanır */
  regularPrice: number;
  items: Localized[];
  frequency: Localized;
  popular?: boolean;
  image: ImageKey;
}

export interface Service {
  slug: string;
  name: Localized;
  summary: Localized;
  description: Localized;
  /** lucide-react ikon adı */
  icon: "Trees" | "Sprout" | "Droplets" | "Leaf" | "SprayCan" | "Shovel";
  /** "...-dan başlayaraq" qiyməti, AZN */
  priceFrom: number;
  priceUnit: Localized;
  includes: Localized[];
  steps: { title: Localized; text: Localized }[];
  /** Abunə ilə göstərilən xidmət ♻️ */
  recurring?: boolean;
  image: ImageKey;
  projectSlugs: string[];
}

export interface SeasonalTip {
  title: Localized;
  text: Localized;
  world: World;
  productSlugs: string[];
}

export interface SeasonalMonth {
  /** 1–12 */
  month: number;
  tips: SeasonalTip[];
}

export interface Project {
  slug: string;
  title: Localized;
  location: Localized;
  world: World;
  before: ImageKey;
  after: ImageKey;
  tags: Localized[];
  year: number;
}

export interface Review {
  id: string;
  author: string;
  avatar?: ImageKey;
  rating: number;
  text: Localized;
  /** ISO tarix */
  date: string;
  source: "google" | "site";
}

export interface Campaign {
  slug: string;
  title: Localized;
  description: Localized;
  discountPercent: number;
  /** ISO tarix — geri sayım taymeri bura qədər sayır */
  endsAt: string;
  image: ImageKey;
  world: World;
  productSlugs: string[];
}

export interface Article {
  slug: string;
  title: Localized;
  excerpt: Localized;
  /** Paraqraflar */
  body: Localized[];
  image: ImageKey;
  world: World;
  /** ISO tarix */
  publishedAt: string;
  readingMinutes: number;
  productSlugs: string[];
}
