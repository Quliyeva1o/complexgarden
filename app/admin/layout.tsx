import type { Metadata } from "next";
import { Suspense } from "react";
import { inter, interTight } from "@/app/fonts";
import { siteConfig } from "@/config/site";
import "../globals.css";

export const metadata: Metadata = {
  title: { default: "Admin panel", template: "%s — Admin" },
  robots: { index: false, follow: false },
};

// Sessiyadan asılıdır — statik qabıq yoxdur, naviqasiya serverdə gözləyir
export const instant = false;

/** Admin paneli: ayrıca root layout, yalnız AZ, indekslənmir */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az" data-theme={siteConfig.theme} className={`${inter.variable} ${interTight.variable}`}>
      <body className="min-h-dvh bg-page text-ink">
        <Suspense fallback={<p className="p-10 text-ink-muted">Yüklənir…</p>}>{children}</Suspense>
      </body>
    </html>
  );
}
