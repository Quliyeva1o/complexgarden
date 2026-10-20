import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";
import type { Locale } from "@/i18n/routing";
import type { Localized } from "@/lib/types";

/**
 * tailwind-merge xüsusi token adlarımızı tanısın deyə genişləndirilib
 * (məs. `text-h2` şrift ölçüsüdür, `text-ink` rəngdir — bir-birini silməməlidir).
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["display", "h1", "h2", "h3", "h4", "lead", "body", "small", "eyebrow", "caption"],
      color: [
        "primary", "primary-hover", "secondary", "accent", "fresh", "on-fresh",
        "page", "surface", "pool", "garden", "ink-strong", "ink", "ink-muted",
        "on-primary", "border", "danger", "success", "white", "world", "world-ink",
      ],
      radius: ["sm", "card", "pill", "media", "tag", "hero"],
      shadow: ["card", "card-hover", "float"],
      spacing: ["section", "section-sm", "heading-gap", "heading-bottom", "card", "grid", "container-pad"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Localized dəyərdən cari dilin mətnini qaytarır (AZ ehtiyat dildir) */
export function localize(value: Localized | string, locale: Locale): string {
  if (typeof value === "string") return value;
  return value[locale] || value.az;
}
