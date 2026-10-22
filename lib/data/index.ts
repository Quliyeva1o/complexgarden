import { supabasePublicEnv } from "@/lib/supabase/env";
import { localRepository } from "./local";
import type { CatalogRepository } from "./repository";
import { supabaseRepository } from "./supabase";

/**
 * Aktiv məlumat mənbəyi: Supabase açarları varsa baza, yoxdursa `/data` faylları.
 * Komponentlər birbaşa `/data`-dan deyil, həmişə `catalog` vasitəsilə oxuyur.
 */
export function chooseRepository(): CatalogRepository {
  return supabasePublicEnv() ? supabaseRepository : localRepository;
}

export const catalog: CatalogRepository = chooseRepository();

export type { CatalogRepository } from "./repository";
export * from "./query";
export * from "./url-query";
