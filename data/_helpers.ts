import type { Localized } from "@/lib/types";

/** Qısa yazılış: L("az", "ru", "en") */
export const L = (az: string, ru: string, en: string): Localized => ({ az, ru, en });
