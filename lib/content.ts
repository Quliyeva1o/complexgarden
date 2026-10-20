import { siteConfig } from "@/config/site";

/** Məzmundakı {threshold}, {fee}, {discount} yerlərini config/site.ts dəyərləri ilə doldurur */
export function fillContent(text: string): string {
  return text
    .replaceAll("{threshold}", String(siteConfig.freeDeliveryThreshold))
    .replaceAll("{fee}", String(siteConfig.deliveryFee))
    .replaceAll("{discount}", String(siteConfig.subscriptionDiscountPercent));
}
