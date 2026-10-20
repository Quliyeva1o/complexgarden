/**
 * Saytın əsas konfiqurasiyası — brend adı, əlaqə, çatdırılma və tema bir yerdən idarə olunur.
 * Brend adı hələlik müvəqqətidir: yalnız `name` sahəsini dəyişmək kifayətdir.
 */

/**
 * Bakı daxili pulsuz çatdırılma həddi (AZN).
 * TODO: real dəyəri təyin edin — hazırda müvəqqəti rəqəmdir. Bütün sayt bu sabitdən oxuyur.
 */
export const FREE_DELIVERY_THRESHOLD_AZN = 150;

/** Hədd altında çatdırılma haqqı (AZN) */
export const DELIVERY_FEE_AZN = 7;

export const themes = ["forest-lagoon", "soft-coast"] as const;
export type ThemeName = (typeof themes)[number];

export const siteConfig = {
  name: "BRAND_NAME",
  url: "https://example.az",

  phone: "+994 12 555 00 00",
  phoneHref: "tel:+994125550000",
  /** wa.me formatında, yalnız rəqəmlər */
  whatsapp: "994505550000",
  /** Ekranda göstərmək üçün */
  whatsappDisplay: "+994 50 555 00 00",
  email: "info@example.az",
  address: {
    az: "Bakı, Nəsimi rayonu, Nümunə küçəsi 1",
    ru: "Баку, Насиминский район, ул. Пример 1",
    en: "1 Example street, Nasimi district, Baku",
  },
  /** Xəritə üçün koordinatlar (Əlaqə səhifəsindəki placeholder) */
  geo: { lat: 40.3777, lng: 49.892 },
  workingHours: {
    weekdays: "09:00 – 19:00",
    saturday: "10:00 – 17:00",
    sunday: null as string | null,
  },

  currency: "AZN",
  freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD_AZN,
  deliveryFee: DELIVERY_FEE_AZN,
  /** Abunə endirimi (faizlə) — məhsul səhifəsindəki "Abunə (−10%)" seçimi */
  subscriptionDiscountPercent: 10,

  timeZone: "Asia/Baku",
  /** Footer-dəki müəllif hüququ ili (cacheComponents rejimində new Date() prerender-də istifadə olunmur) */
  copyrightYear: 2026,

  social: {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    youtube: "https://youtube.com/",
    tiktok: "https://tiktok.com/",
  },

  /** Aktiv rəng palitrası — `<html data-theme>` atributuna yazılır */
  theme: "forest-lagoon" as ThemeName,
} as const;

export type SiteConfig = typeof siteConfig;
