"use client";

import { create } from "zustand";

/** Header, mobil menyu və alt panel arasında paylaşılan UI vəziyyəti (yaddaşda saxlanmır) */
interface UiState {
  menuOpen: boolean;
  searchOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
}

export const useUi = create<UiState>()((set) => ({
  menuOpen: false,
  searchOpen: false,
  setMenuOpen: (menuOpen) => set({ menuOpen, searchOpen: false }),
  setSearchOpen: (searchOpen) => set({ searchOpen, menuOpen: false }),
}));
