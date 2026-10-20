"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface CartLineOptions {
  /** Abunə tezliyi (gün) — verilsə sətir abunə kimi qiymətləndirilir */
  subscriptionDays?: number;
  /** Əkin / quraşdırma xidməti əlavə olunub */
  service?: boolean;
}

export interface CartLine {
  /** slug + seçimlərdən qurulan unikal açar */
  key: string;
  slug: string;
  quantity: number;
  options: CartLineOptions;
}

interface CartState {
  lines: CartLine[];
  add: (slug: string, quantity?: number, options?: CartLineOptions) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
}

export const lineKey = (slug: string, options: CartLineOptions = {}) =>
  [slug, options.subscriptionDays ? `sub${options.subscriptionDays}` : "", options.service ? "svc" : ""]
    .filter(Boolean)
    .join(":");

/** Səbət — client tərəfdə, localStorage-da saxlanılır */
export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (slug, quantity = 1, options = {}) =>
        set((state) => {
          const key = lineKey(slug, options);
          const existing = state.lines.find((l) => l.key === key);
          if (existing) {
            return {
              lines: state.lines.map((l) => (l.key === key ? { ...l, quantity: l.quantity + quantity } : l)),
            };
          }
          return { lines: [...state.lines, { key, slug, quantity, options }] };
        }),
      setQuantity: (key, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((l) => l.key !== key)
              : state.lines.map((l) => (l.key === key ? { ...l, quantity } : l)),
        })),
      remove: (key) => set((state) => ({ lines: state.lines.filter((l) => l.key !== key) })),
      clear: () => set({ lines: [] }),
    }),
    { name: "cart", version: 1, storage: createJSONStorage(() => localStorage) },
  ),
);

export const selectCartCount = (state: CartState) => state.lines.reduce((sum, l) => sum + l.quantity, 0);
