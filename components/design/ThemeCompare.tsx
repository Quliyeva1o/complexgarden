import type { ReactNode } from "react";
import { themes, type ThemeName } from "@/config/site";
import { cn } from "@/lib/utils";

type ThemeCompareProps = {
  /** Hər tema üçün eyni məzmun render olunur. Funksiya verilsə tema adını alır (məs. unikal id-lər üçün). */
  children: ReactNode | ((theme: ThemeName) => ReactNode);
  /** Blokun daxili boşluğu (məs. tam enli Section nümunələri üçün none) */
  padded?: boolean;
  className?: string;
};

/**
 * Məzmunu hər palitrada yan-yana göstərir. Hər sütun öz `data-theme` atributunu daşıyır,
 * ona görə komponentlər heç bir dəyişiklik olmadan həmin temanın tokenlərini alır.
 */
export function ThemeCompare({ children, padded = true, className }: ThemeCompareProps) {
  return (
    <div className={cn("grid gap-grid lg:grid-cols-2", className)}>
      {themes.map((theme) => (
        <div key={theme} data-theme={theme} className="min-w-0 overflow-hidden rounded-card border border-border bg-page">
          <div className="flex items-center gap-2 border-b border-border bg-surface px-card py-2">
            <span aria-hidden className="size-3 rounded-pill bg-primary" />
            <span aria-hidden className="size-3 rounded-pill bg-secondary" />
            <span aria-hidden className="size-3 rounded-pill bg-accent" />
            <span aria-hidden className="size-3 rounded-pill bg-fresh" />
            <code className="ml-1 text-caption">{theme}</code>
          </div>
          <div className={cn(padded && "p-card")}>{typeof children === "function" ? children(theme) : children}</div>
        </div>
      ))}
    </div>
  );
}

/** Nümunənin üstündə vəziyyət etiketi (Normal / Hover / Focus ...) */
export function StateLabel({ children }: { children: ReactNode }) {
  return <span className="mb-2 block text-caption">{children}</span>;
}

/** Rəng nümunəsi — dəyər CSS dəyişənindən oxunur, hex yazılmır */
export function Swatch({ token, label, dark = false }: { token: string; label: string; dark?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span
        className={cn("h-14 rounded-sm border border-border", dark && "border-transparent")}
        style={{ background: `var(${token})` }}
      />
      <span className="text-caption text-ink-strong">{label}</span>
      <code className="text-caption">{token}</code>
    </div>
  );
}
