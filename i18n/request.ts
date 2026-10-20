import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";
import { siteConfig } from "@/config/site";
import { routing } from "./routing";

// Locale `app/[locale]` root layout-un parametrindən oxunur (next/root-params),
// beləliklə səhifələr cacheComponents rejimində statik prerender oluna bilir.
export default getRequestConfig(async () => {
  const value = await rootLocale();
  const locale = hasLocale(routing.locales, value) ? value : routing.defaultLocale;

  return {
    locale,
    timeZone: siteConfig.timeZone,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
