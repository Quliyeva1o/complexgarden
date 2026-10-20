import type { Campaign } from "@/lib/types";
import { L } from "./_helpers";

/** Kampaniyalar. `endsAt` geri sayım taymerinin bitmə vaxtıdır (Bakı vaxtı, +04:00). */
export const campaigns: Campaign[] = [
  {
    slug: "hovuz-baglanisi-paketi",
    world: "pool",
    image: "poolInfinity",
    discountPercent: 20,
    endsAt: "2026-11-15T23:59:59+04:00",
    title: L("Hovuz bağlanışı paketi −20%", "Пакет консервации бассейна −20%", "Pool closing kit −20%"),
    description: L(
      "Qışa hazırlıq üçün hər şey bir dəstdə: pH azaldıcı, şok xlor, yosun əleyhinə vasitə və istilik örtüyü.",
      "Всё для подготовки к зиме в одном наборе: pH-минус, шоковый хлор, альгицид и покрытие.",
      "Everything to winterise in one kit: pH minus, shock chlorine, algaecide and a cover.",
    ),
    productSlugs: ["ph-minus-qranul-5kq", "xlor-tabletleri-200q-5kq", "yosun-eleyhine-1l", "istilik-ortuyu-8x4"],
  },
  {
    slug: "payiz-ekin-hefteleri",
    world: "garden",
    image: "planting",
    discountPercent: 15,
    endsAt: "2026-11-30T23:59:59+04:00",
    title: L("Payız əkin həftələri −15%", "Недели осенней посадки −15%", "Autumn planting weeks −15%"),
    description: L(
      "Canlı çit bitkiləri və torf — əkin xidməti ilə birlikdə.",
      "Растения для живой изгороди и торф — вместе с услугой посадки.",
      "Hedge plants and peat — with planting service included.",
    ),
    productSlugs: ["leylandi-1-5m", "tuya-smaragd-1-2m", "fotiniya-red-robin-1m", "torf-50l"],
  },
];
