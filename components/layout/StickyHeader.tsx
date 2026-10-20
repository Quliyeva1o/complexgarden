"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const subscribe = (onChange: () => void) => {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
};
const isScrolled = () => window.scrollY > 48;
const serverSnapshot = () => false;

/**
 * Header-in yapışqan hissəsi. Səhifə sürüşəndə `data-scrolled` atributu qoyulur —
 * uşaq elementlər `group-data-scrolled/header:` ilə kiçilir (kapsul hündürlüyü, kölgə).
 */
export function StickyHeader({ children, className }: { children: ReactNode; className?: string }) {
  const scrolled = useSyncExternalStore(subscribe, isScrolled, serverSnapshot);

  return (
    <div data-scrolled={scrolled || undefined} className={cn("group/header sticky top-0 z-40", className)}>
      {children}
    </div>
  );
}
