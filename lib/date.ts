import { cacheLife } from "next/cache";
import { siteConfig } from "@/config/site";
import { formatMonthName } from "@/lib/format";

/**
 * Bakı vaxtı ilə cari ay (1–12).
 * cacheComponents rejimində `new Date()` prerender zamanı birbaşa oxuna bilmir —
 * dəyər "use cache" ilə tutulur və saatbaşı yenilənir (ay dəyişəndə ən gec 1 saata yenilənir).
 */
export async function getCurrentMonth(): Promise<number> {
  "use cache";
  cacheLife("hours");
  const month = new Intl.DateTimeFormat("en-US", { month: "numeric", timeZone: siteConfig.timeZone }).format(new Date());
  return Number(month);
}

/** Ayın adı istifadəçinin dilində, böyük hərflə: "Oktyabr", "Октябрь", "October" */
export function monthName(month: number, locale: string): string {
  return formatMonthName(month, locale);
}
