/**
 * Saytın əsas konfiqurasiyası — brend adı, əlaqə, çatdırılma və tema bir yerdən idarə olunur.
 * Brend adı və loqo faylları buradan idarə olunur (public/brand, public/icons).
 */

/**
 * Bakı daxili pulsuz çatdırılma həddi (AZN).
 * TODO: real dəyəri təyin edin — hazırda müvəqqəti rəqəmdir. Bütün sayt bu sabitdən oxuyur.
 */
export const FREE_DELIVERY_THRESHOLD_AZN = 150;

/** Hədd altında çatdırılma haqqı (AZN) */
export const DELIVERY_FEE_AZN = 7;

/** Loqo yazısının şrift variantları (yükləmə: components/layout/logo-fonts.ts, üslub: globals.css) */
export const logoFontLabels = {
  jakarta: "Plus Jakarta Sans",
  outfit: "Outfit",
  lexend: "Lexend",
  pacifico: "Pacifico",
  vibes: "Great Vibes",
} as const;
export type LogoFont = keyof typeof logoFontLabels;
export const logoFonts = Object.keys(logoFontLabels) as LogoFont[];

export const themes = ["forest-lagoon", "soft-coast"] as const;
export type ThemeName = (typeof themes)[number];

export const siteConfig = {
  name: "Complex Garden",
  tagline: "Garden & Pool",
  /** Loqo faylları — public/brand (orijinallar public/brand/original-da) */
  logo: {
    /** Yalnız işarə (palma + dalğa), şəffaf fon (237×256). Yanındakı yazı mətndir — bax `font` */
    mark: "/brand/logo-mark.png",
    markSize: { width: 237, height: 256 },
    /**
     * Yanındakı yazının ("Complex Garden / Garden & Pool") şrifti. Yazı şəkil deyil, mətndir —
     * dəyişmək üçün bu dəyəri `logoFontLabels`-dəki açarlardan biri edin.
     */
    font: "jakarta" as LogoFont,
    /** Header-də loqonun yanında şrift dəyişdirmə düyməsi (seçim üçün müvəqqəti) — seçimdən sonra `false` */
    fontPicker: true,
    /** Sosial şəbəkə paylaşımı üçün (1200×630) */
    og: "/brand/og-image.jpg",
  },
  /** Saytın əsas ünvanı (canonical, sitemap, Open Graph). Produksiyada NEXT_PUBLIC_SITE_URL ilə təyin edin */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.az",

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
