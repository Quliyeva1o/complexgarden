import type { Review } from "@/lib/types";
import { L } from "./_helpers";

/** Ümumi Google reytinqi (demo) */
export const reviewSummary = { rating: 4.9, count: 312 };

/** Nümunə rəylər — real rəylərlə əvəz edilməlidir */
export const reviews: Review[] = [
  {
    id: "r1",
    author: "Leyla M.",
    avatar: "avatar1",
    rating: 5,
    source: "google",
    date: "2026-09-12",
    text: L(
      "Leylandiləri həm gətirdilər, həm də əkdilər. Üç ay keçib, hamısı tutub. Suvarma sistemini də onlar qurdular.",
      "Привезли и посадили лейланди. Прошло три месяца — прижились все. Систему полива тоже ставили они.",
      "They delivered and planted our Leyland cypresses. Three months on, every one has taken. They fitted the irrigation too.",
    ),
  },
  {
    id: "r2",
    author: "Rəşad Ə.",
    avatar: "avatar2",
    rating: 5,
    source: "google",
    date: "2026-08-03",
    text: L(
      "Hovuz kimyasına abunə olmuşam, hər ay vaxtında gəlir. Artıq dərman bitəndə mağazaya qaçmıram.",
      "Оформил подписку на химию для бассейна — каждый месяц привозят вовремя. Больше не бегаю в магазин.",
      "I subscribed to pool chemicals and they arrive on time every month. No more last-minute shop runs.",
    ),
  },
  {
    id: "r3",
    author: "Aynur H.",
    avatar: "avatar3",
    rating: 5,
    source: "google",
    date: "2026-07-21",
    text: L(
      "Su filtrini quraşdırdılar, kartuş dəyişmə vaxtını özləri xatırladırlar. Çaydanda ərp qalmadı.",
      "Установили фильтр для воды и сами напоминают о замене картриджей. Накипи в чайнике больше нет.",
      "They installed our water filter and remind us when cartridges are due. No more scale in the kettle.",
    ),
  },
  {
    id: "r4",
    author: "Elvin Q.",
    avatar: "avatar4",
    rating: 5,
    source: "google",
    date: "2026-06-30",
    text: L(
      "Robot-süpürgəni sifarişlə gətirdilər, bir həftəyə çatdı. Necə işlədiyini yerində göstərdilər.",
      "Робот-пылесос привезли под заказ за неделю. На месте показали, как он работает.",
      "The robotic cleaner was ordered in and arrived within a week. They showed us how it works on site.",
    ),
  },
  {
    id: "r5",
    author: "Nigar S.",
    rating: 4,
    source: "site",
    date: "2026-05-14",
    text: L(
      "Palma gözəldir, sağlamdır. Çatdırılma bir gün gecikdi, amma əvvəlcədən zəng edib xəbər verdilər.",
      "Пальма красивая и здоровая. Доставка задержалась на день, но заранее позвонили и предупредили.",
      "The palm is beautiful and healthy. Delivery slipped a day, but they called ahead to let us know.",
    ),
  },
  {
    id: "r6",
    author: "Otel menecmenti, Qəbələ",
    rating: 5,
    source: "google",
    date: "2026-04-02",
    text: L(
      "Otel ərazisinin baxımını iki ildir onlara etibar edirik. Hər gəlişdən sonra foto hesabat gəlir.",
      "Два года доверяем им уход за территорией отеля. После каждого визита — фотоотчёт.",
      "We've trusted them with our hotel grounds for two years. Every visit comes with a photo report.",
    ),
  },
];
