import { formatNumber } from "@/lib/format";
import type { Dosage } from "@/lib/types";

export interface DosageResult {
  /** Bir tətbiqə lazım olan miqdar (packUnit ilə) */
  perUse: number;
  /** Bir qablaşdırmadan neçə tətbiq çıxır */
  uses: number;
  /** Bir qablaşdırmanın çatdığı gün sayı */
  lastsDays: number;
}

/** Hovuz həcmi (m³) və ya sahə (m²) üzrə dozaj: bir dəfəyə nə qədər və qablaşdırma nə qədər çatır */
export function computeDosage(dosage: Dosage, size: number): DosageResult | null {
  if (!Number.isFinite(size) || size <= 0) return null;
  const perUse = size * dosage.amountPerUnit;
  // Tabletlər bölünmür — yuxarı yuvarlaqlaşdırılır
  const perUseRounded = dosage.packUnit === "tablet" ? Math.ceil(perUse) : perUse;
  const uses = dosage.packAmount / perUseRounded;
  return { perUse: perUseRounded, uses, lastsDays: Math.floor(uses) * dosage.intervalDays };
}

/** Abunə tezlikləri (gün) */
export const subscriptionFrequencies = [14, 30, 60] as const;
export type SubscriptionFrequency = (typeof subscriptionFrequencies)[number];

/** Qablaşdırma bitməmiş yenisi gəlsin: çatma müddətindən böyük olmayan ən uzun tezlik */
export function recommendFrequency(lastsDays: number): SubscriptionFrequency {
  const fitting = subscriptionFrequencies.filter((f) => f <= lastsDays);
  return fitting.length ? fitting[fitting.length - 1] : subscriptionFrequencies[0];
}

const unitLabels: Record<string, Record<string, string>> = {
  az: { g: "q", kg: "kq", ml: "ml", L: "L", tablet: "tablet" },
  ru: { g: "г", kg: "кг", ml: "мл", L: "л", tablet: "табл." },
  en: { g: "g", kg: "kg", ml: "ml", L: "L", tablet: "tablets" },
};

/** 1250 g → "1,25 kq", 400 ml → "400 ml", 2 tablet → "2 tablet" */
export function formatAmount(amount: number, unit: string, locale: string): string {
  const labels = unitLabels[locale] ?? unitLabels.az;
  let value = amount;
  let u = unit;
  if (unit === "g" && amount >= 1000) [value, u] = [amount / 1000, "kg"];
  if (unit === "ml" && amount >= 1000) [value, u] = [amount / 1000, "L"];
  const n = formatNumber(value, locale, value < 10 ? 2 : 0);
  return `${n} ${labels[u] ?? u}`;
}
