import { localRepository } from "./local";
import type { CatalogRepository } from "./repository";

/**
 * Aktiv məlumat mənbəyi. Supabase / Medusa / Shopify-a keçəndə yalnız bu sətri dəyişin.
 * Komponentlər birbaşa `/data`-dan deyil, həmişə `catalog` vasitəsilə oxuyur.
 */
export const catalog: CatalogRepository = localRepository;

export type { CatalogRepository } from "./repository";
export * from "./query";
export * from "./url-query";
