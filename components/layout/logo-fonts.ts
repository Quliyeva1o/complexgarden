import { Great_Vibes, Lexend, Outfit, Pacifico, Plus_Jakarta_Sans } from "next/font/google";

/**
 * Loqo yazısı üçün şrift variantları. Hər biri CSS dəyişəni kimi <html>-ə qoşulur,
 * hansının işlədiyini `<html data-logo-font>` seçir (qaydalar globals.css-də, "Loqo yazısı" bölməsində).
 * Brauzer yalnız ekranda istifadə olunan şrifti endirir.
 * `preload` literal olmalıdır (next/font tələbi) — config/site.ts-də `logo.font` dəyişəndə
 * seçilən şriftin `preload`-unu `true`, qalanlarını `false` edin.
 * Brend adı yalnız latın hərflərindən ibarətdir — latin alt dəsti kifayətdir.
 */

// Plus Jakarta Sans alt yazı ("Garden & Pool") üçün də default şriftdir
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], display: "swap", variable: "--font-logo-jakarta", preload: true });
const outfit = Outfit({ subsets: ["latin"], display: "swap", variable: "--font-logo-outfit", preload: false });
const lexend = Lexend({ subsets: ["latin"], display: "swap", variable: "--font-logo-lexend", preload: false });
const pacifico = Pacifico({ subsets: ["latin"], weight: "400", display: "swap", variable: "--font-logo-pacifico", preload: false });
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400", display: "swap", variable: "--font-logo-vibes", preload: false });

/** <html> className-ə əlavə olunur */
export const logoFontVariables = [jakarta, outfit, lexend, pacifico, greatVibes].map((f) => f.variable).join(" ");
