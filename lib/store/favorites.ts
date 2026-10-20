"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface FavoritesState {
  slugs: string[];
  toggle: (slug: string) => void;
}

/** Seçilmişlər — client tərəfdə, localStorage-da saxlanılır */
export const useFavorites = create<FavoritesState>()(
  persist(
    (set) => ({
      slugs: [],
      toggle: (slug) =>
        set((state) => ({
          slugs: state.slugs.includes(slug) ? state.slugs.filter((s) => s !== slug) : [...state.slugs, slug],
        })),
    }),
    { name: "favorites", version: 1, storage: createJSONStorage(() => localStorage) },
  ),
);
