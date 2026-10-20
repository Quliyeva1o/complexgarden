import type { Project } from "@/lib/types";
import { L } from "./_helpers";

/** Əvvəl/sonra layihələri (demo). Şəkillər real layihə fotoları ilə əvəz edilməlidir. */
export const projects: Project[] = [
  {
    slug: "mardakan-villa",
    world: "garden",
    year: 2025,
    before: "soilHands",
    after: "houseGarden",
    title: L("Villa həyəti, 600 m²", "Двор виллы, 600 м²", "Villa garden, 600 m²"),
    location: L("Mərdəkan", "Мардакян", "Mardakan"),
    tags: [L("Landşaft dizaynı", "Ландшафтный дизайн", "Landscape design"), L("Rulon qazon", "Рулонный газон", "Turf"), L("Damcı suvarma", "Капельный полив", "Drip irrigation")],
  },
  {
    slug: "novxani-hovuz",
    world: "pool",
    year: 2025,
    before: "fields",
    after: "poolVilla",
    title: L("Hovuz və hovuzkənarı zona", "Бассейн и зона у бассейна", "Pool and poolside"),
    location: L("Novxanı", "Новханы", "Novkhani"),
    tags: [L("Hovuz avadanlığı", "Оборудование бассейна", "Pool equipment"), L("Palmalar", "Пальмы", "Palms"), L("İşıqlandırma", "Освещение", "Lighting")],
  },
  {
    slug: "sixov-otel",
    world: "garden",
    year: 2024,
    before: "farmerPlanting",
    after: "palmResort",
    title: L("Otel ərazisinin yaşıllaşdırılması", "Озеленение территории отеля", "Hotel grounds landscaping"),
    location: L("Şıxov", "Шихово", "Shikhov"),
    tags: [L("Mövsümi baxım", "Сезонный уход", "Seasonal care"), L("Palmalar", "Пальмы", "Palms"), L("Suvarma", "Полив", "Irrigation")],
  },
];
