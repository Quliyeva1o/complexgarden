import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["az", "ru", "en"],
  defaultLocale: "az",
  // AZ əsas dildir: brauzer dilinə görə avtomatik yönləndirmə yoxdur, dil yalnız seçimlə dəyişir
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
