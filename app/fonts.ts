import { Inter, Inter_Tight } from "next/font/google";

// Hər iki root layout (sayt və admin) üçün ortaq şriftlər.
// latin-ext — Ə ə Ğ ğ İ ı Ş ş Ç ç Ö ö Ü ü; cyrillic — RU versiyası üçün.
// Qeyd: kiril dəstini ayrıca, preload-suz şriftə ayırmaq və variable Inter Tight sınaqdan keçirildi —
// ümumi şrift həcmi 300 KB-dan 527 KB-a artdı, ona görə bu konfiqurasiya saxlanılır.
export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext", "cyrillic"],
  display: "swap",
});

export const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["500", "600"],
  display: "swap",
});
