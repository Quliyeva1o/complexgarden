import type { Article } from "@/lib/types";
import { L } from "./_helpers";

/** Bələdçilər (bloq) — 3 nümunə məqalə */
export const articles: Article[] = [
  {
    slug: "hovuzu-qisa-nece-baglamali",
    world: "pool",
    image: "poolVilla",
    publishedAt: "2026-10-05",
    readingMinutes: 5,
    productSlugs: ["ph-minus-qranul-5kq", "xlor-tabletleri-200q-5kq", "istilik-ortuyu-8x4"],
    title: L("Hovuzu qışa necə bağlamalı: 6 addım", "Как законсервировать бассейн на зиму: 6 шагов", "How to winterise your pool in 6 steps"),
    excerpt: L(
      "Düzgün bağlanmış hovuz yazda təmiz su ilə açılır. Bütün iş bir gün çəkir.",
      "Правильно законсервированный бассейн весной открывается с чистой водой. Вся работа занимает день.",
      "A properly closed pool opens with clear water in spring. The whole job takes a day.",
    ),
    body: [
      L("Hovuzu təmizləyin: dibi süpürün, divarları fırçalayın, skimmer səbətlərini boşaldın.", "Очистите бассейн: пропылесосьте дно, почистите стенки, опустошите корзины скиммеров.", "Clean the pool: vacuum the floor, brush the walls and empty the skimmer baskets."),
      L("pH-ı 7.2–7.4 aralığına gətirin, sonra şok xlorlama edin.", "Доведите pH до 7.2–7.4, затем проведите шоковое хлорирование.", "Bring pH to 7.2–7.4, then shock-chlorinate."),
      L("Yosun əleyhinə qış dozası əlavə edin və filtri 24 saat işlədin.", "Добавьте зимнюю дозу альгицида и запустите фильтр на 24 часа.", "Add a winter dose of algaecide and run the filter for 24 hours."),
      L("Su səviyyəsini skimmerdən 10–15 sm aşağı endirin, boruları boşaldın.", "Понизьте уровень воды на 10–15 см ниже скиммера и слейте трубы.", "Lower the water 10–15 cm below the skimmer and drain the lines."),
      L("Hovuzu örtün — örtük yarpaq və tozun suya düşməsinin qarşısını alır.", "Накройте бассейн — покрытие не пустит листья и пыль.", "Cover the pool to keep leaves and dust out."),
    ],
  },
  {
    slug: "absheronda-canli-cit",
    world: "garden",
    image: "lushGarden",
    publishedAt: "2026-09-18",
    readingMinutes: 6,
    productSlugs: ["leylandi-1-5m", "fotiniya-red-robin-1m", "damci-boru-16mm-100m"],
    title: L("Abşeronda canlı çit: hansı bitkini seçməli", "Живая изгородь на Апшероне: какое растение выбрать", "Hedging on Absheron: which plant to choose"),
    excerpt: L(
      "Külək, quraqlıq və duzlu torpaq — bu üç şərtə dözən bitkilər.",
      "Ветер, засуха и засолённая почва — растения, которые выдерживают все три условия.",
      "Wind, drought and saline soil — the plants that handle all three.",
    ),
    body: [
      L("Leylandi ən sürətli böyüyən seçimdir: 2–3 ilə tam bağlı çit verir.", "Лейланди растёт быстрее всех: плотная изгородь за 2–3 года.", "Leyland cypress is the fastest: a solid screen in 2–3 years."),
      L("Fotiniya rəngli və qayçılamaya davamlıdır — alçaq və orta çitlər üçün.", "Фотиния декоративна и хорошо переносит стрижку — для низких и средних изгородей.", "Photinia adds colour and takes clipping — for low and mid-height hedges."),
      L("Əkin zamanı hər çuxura torf qatın və damcı boru çəkin: ilk yay həlledicidir.", "При посадке добавьте торф в каждую яму и проложите капельную трубку: первое лето решающее.", "Add peat to each hole and lay dripline when planting: the first summer is decisive."),
    ],
  },
  {
    slug: "ev-suyu-filtri-secimi",
    world: "pool",
    image: "bathroom",
    publishedAt: "2026-08-22",
    readingMinutes: 4,
    productSlugs: ["ters-osmos-5-merhele", "magistral-filtr-10", "kartus-desti-3-merhele"],
    title: L("Ev üçün su filtri: osmos, yumşaltma, yoxsa magistral?", "Фильтр для дома: осмос, умягчитель или магистральный?", "Home water filters: RO, softener or inline?"),
    excerpt: L(
      "Üç növ filtr fərqli problemləri həll edir. Hansının sizə lazım olduğunu müəyyənləşdirək.",
      "Три типа фильтров решают разные задачи. Разберёмся, какой нужен вам.",
      "Three filter types solve different problems. Here's how to tell which you need.",
    ),
    body: [
      L("Magistral filtr qum və pası tutur — hər ev üçün minimumdur.", "Магистральный фильтр задерживает песок и ржавчину — минимум для любого дома.", "An inline filter catches sand and rust — the baseline for every home."),
      L("Yumşaltma sistemi ərpi aradan qaldırır və cihazları qoruyur.", "Умягчитель убирает накипь и защищает технику.", "A softener removes scale and protects appliances."),
      L("Tərs osmos içməli su verir — mətbəxdə ayrıca kranla.", "Обратный осмос даёт питьевую воду — через отдельный кран на кухне.", "Reverse osmosis gives drinking water through a separate kitchen faucet."),
    ],
  },
];
