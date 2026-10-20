import type { routing } from "@/i18n/routing";
import type messages from "./messages/az.json";

// next-intl üçün tip təhlükəsizliyi: açarlar az.json-dan yoxlanılır
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
