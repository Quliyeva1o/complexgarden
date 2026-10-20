import { notFound } from "next/navigation";

/**
 * Dil daxilində tanınmayan bütün ünvanlar brend üslubundakı 404 səhifəsinə düşür (app/[locale]/not-found.tsx).
 * Səhifə həmişə notFound() atdığı üçün ani keçid yoxlaması mümkün deyil — sənədləşdirilmiş istisna.
 */
export const instant = false;

export default function CatchAll() {
  notFound();
}
