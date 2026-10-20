import type { SubscriptionPlan } from "@/lib/types";
import { L } from "./_helpers";

/** Abunə paketləri. Qənaət faizi `regularPrice` və `monthlyPrice` fərqindən hesablanır. */
export const subscriptionPlans: SubscriptionPlan[] = [
  {
    slug: "ayliq-hovuz-qullugu",
    world: "pool",
    image: "poolWater",
    name: L("Aylıq hovuz qulluğu", "Ежемесячный уход за бассейном", "Monthly pool care"),
    description: L(
      "40–60 m³ hovuz üçün bir aylıq kimya dəsti, hər ayın əvvəlində qapınıza.",
      "Месячный комплект химии для бассейна 40–60 м³ — в начале каждого месяца у вашей двери.",
      "A month's chemicals for a 40–60 m³ pool, delivered at the start of each month.",
    ),
    monthlyPrice: 79,
    regularPrice: 98,
    frequency: L("Ayda bir dəfə, may–oktyabr", "Раз в месяц, май–октябрь", "Monthly, May–October"),
    items: [
      L("Xlor tabletləri 200 q — 10 ədəd", "Хлор в таблетках 200 г — 10 шт.", "Chlorine tablets 200 g — 10 pcs"),
      L("pH azaldıcı — 2 kq", "pH-минус — 2 кг", "pH minus — 2 kg"),
      L("Yosun əleyhinə vasitə — 1 L", "Альгицид — 1 л", "Algaecide — 1 L"),
      L("Test zolaqları — 50 ədəd", "Тест-полоски — 50 шт.", "Test strips — 50 pcs"),
    ],
  },
  {
    slug: "movsumi-bag-paketi",
    world: "garden",
    image: "gardenBed",
    popular: true,
    name: L("Mövsümi bağ paketi", "Сезонный садовый пакет", "Seasonal garden pack"),
    description: L(
      "Fəslə uyğun gübrə və qoruyucu vasitələr — nə vaxt nə veriləcəyini biz düşünürük.",
      "Удобрения и средства защиты по сезону — мы сами решаем, что и когда нужно.",
      "Season-matched feed and protection — we work out what your garden needs and when.",
    ),
    monthlyPrice: 45,
    regularPrice: 58,
    frequency: L("Ayda bir dəfə, mart–noyabr", "Раз в месяц, март–ноябрь", "Monthly, March–November"),
    items: [
      L("Mövsümə uyğun gübrə — 3–5 kq", "Сезонное удобрение — 3–5 кг", "Seasonal fertiliser — 3–5 kg"),
      L("Bitki dərmanı (lazım olduqda)", "Средство защиты (по необходимости)", "Plant protection (as needed)"),
      L("Ayın qulluq təqvimi", "Календарь ухода на месяц", "Monthly care calendar"),
      L("Aqronomla pulsuz telefon məsləhəti", "Бесплатная консультация агронома", "Free phone call with an agronomist"),
    ],
  },
  {
    slug: "su-filtri-kartuslari",
    world: "pool",
    image: "technician",
    name: L("Su filtri kartuşları", "Картриджи для фильтра воды", "Water filter cartridges"),
    description: L(
      "Osmos və magistral filtrlər üçün kartuşlar vaxtında — dəyişmə günü sizə xatırladırıq.",
      "Картриджи для осмоса и магистральных фильтров вовремя — напомним о дне замены.",
      "Cartridges for RO and inline filters on schedule — we remind you on replacement day.",
    ),
    monthlyPrice: 14,
    regularPrice: 17,
    frequency: L("Hər 3 ayda çatdırılma", "Доставка раз в 3 месяца", "Delivered every 3 months"),
    items: [
      L("3 mərhələli kartuş dəsti", "Комплект картриджей, 3 ступени", "3-stage cartridge set"),
      L("PP kartuş 5 mkm — 3 ədəd", "Картридж PP 5 мкм — 3 шт.", "PP cartridge 5 µm — 3 pcs"),
      L("Dəyişmə üçün ustanın gəlişi — pulsuz", "Выезд мастера на замену — бесплатно", "Technician visit for replacement — free"),
    ],
  },
];
