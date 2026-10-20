import type { Service } from "@/lib/types";
import { L } from "./_helpers";

/** Xidmətlər. Qiymətlər "...-dan başlayaraq" göstərilir (AZN). */
export const services: Service[] = [
  {
    slug: "landsaft-dizayni",
    icon: "Trees",
    image: "houseGarden",
    priceFrom: 600,
    priceUnit: L("layihə", "проект", "per project"),
    name: L("Landşaft dizaynı", "Ландшафтный дизайн", "Landscape design"),
    summary: L(
      "Həyətin planı, bitki seçimi və 3D vizual — işə başlamazdan əvvəl nəticəni görün.",
      "План участка, подбор растений и 3D-визуализация — увидьте результат до начала работ.",
      "Site plan, plant selection and 3D visuals — see the result before work starts.",
    ),
    description: L(
      "Ərazini ölçür, torpağı və günəş rejimini qiymətləndiririk. Sonra zonalaşdırma, bitki siyahısı, suvarma və işıqlandırma sxemi ilə tam layihə hazırlayırıq.",
      "Измеряем участок, оцениваем почву и инсоляцию. Затем готовим полный проект: зонирование, ассортимент растений, схемы полива и освещения.",
      "We survey the site, soil and sun exposure, then deliver a full plan: zoning, planting list, irrigation and lighting layouts.",
    ),
    includes: [
      L("Ərazinin ölçülməsi və torpaq analizi", "Обмер участка и анализ почвы", "Site survey and soil test"),
      L("Baş plan və 3D vizualizasiya", "Генплан и 3D-визуализация", "Master plan and 3D visuals"),
      L("Bitki siyahısı və smeta", "Ассортиментная ведомость и смета", "Planting list and estimate"),
      L("Suvarma və işıqlandırma sxemi", "Схемы полива и освещения", "Irrigation and lighting layout"),
    ],
    steps: [
      { title: L("Görüş", "Встреча", "Visit"), text: L("Ərazinə baxır, istəklərinizi dinləyirik.", "Осматриваем участок и обсуждаем пожелания.", "We walk the site and hear what you want.") },
      { title: L("Konsepsiya", "Концепция", "Concept"), text: L("2 variant eskiz və büdcə təqdim edirik.", "Показываем 2 варианта эскиза и бюджет.", "We present two sketch options with budgets.") },
      { title: L("Layihə", "Проект", "Design"), text: L("Seçilmiş variantı 3D və smeta ilə tamamlayırıq.", "Дорабатываем выбранный вариант с 3D и сметой.", "We finalise the chosen option with 3D and costs.") },
      { title: L("Həyata keçirmə", "Реализация", "Build"), text: L("Öz komandamız layihəni qurur.", "Наша команда воплощает проект.", "Our own crew builds it.") },
    ],
    projectSlugs: ["mardakan-villa", "novxani-hovuz"],
  },
  {
    slug: "agac-ekimi",
    icon: "Sprout",
    image: "planting",
    priceFrom: 8,
    priceUnit: L("bitki", "растение", "per plant"),
    name: L("Ağac əkimi və köçürülməsi", "Посадка и пересадка деревьев", "Tree planting & transplanting"),
    summary: L(
      "Tingliyimizdən aldığınız bitkiləri əkir, böyük ağacları kök topu ilə köçürürük.",
      "Сажаем растения из нашего питомника, пересаживаем крупномеры с комом.",
      "We plant what you buy from our nursery and move mature trees with their root ball.",
    ),
    description: L(
      "Çuxur qazılması, torpaq qarışığı, əkin, dayaq və ilk suvarma daxildir. Bizim əkdiyimiz bitkilərə 3 ay tutma zəmanəti veririk.",
      "Включает копку ямы, грунтосмесь, посадку, опору и первый полив. На растения, посаженные нами, — гарантия приживаемости 3 месяца.",
      "Includes digging, soil mix, planting, staking and first watering. Plants we install carry a 3-month survival guarantee.",
    ),
    includes: [
      L("Əkin çuxuru və torpaq qarışığı", "Посадочная яма и грунтосмесь", "Planting hole and soil mix"),
      L("Dayaq və bağlama", "Опора и подвязка", "Staking and ties"),
      L("İlk suvarma və gübrə", "Первый полив и подкормка", "First watering and feed"),
      L("3 ay tutma zəmanəti", "Гарантия приживаемости 3 месяца", "3-month survival guarantee"),
    ],
    steps: [
      { title: L("Seçim", "Выбор", "Choose"), text: L("Bitkini saytda seçin və ya tingliyə gəlin.", "Выберите растение на сайте или в питомнике.", "Pick plants online or at the nursery.") },
      { title: L("Çatdırılma", "Доставка", "Deliver"), text: L("Bitkiləri razılaşdırılmış gün gətiririk.", "Привозим растения в согласованный день.", "We deliver on the agreed day.") },
      { title: L("Əkin", "Посадка", "Plant"), text: L("Usta əkir, suvarır və qulluq qaydalarını izah edir.", "Мастер сажает, поливает и объясняет уход.", "We plant, water and explain aftercare.") },
    ],
    projectSlugs: ["mardakan-villa"],
  },
  {
    slug: "suvarma-qurasdirma",
    icon: "Droplets",
    image: "lawn",
    priceFrom: 4,
    priceUnit: L("m²", "м²", "per m²"),
    name: L("Suvarma sisteminin quraşdırılması", "Монтаж системы полива", "Irrigation installation"),
    summary: L(
      "Damcı və yeraltı suvarma: layihə, quraşdırma və ağıllı idarəetmə.",
      "Капельный и подземный полив: проект, монтаж и умное управление.",
      "Drip and in-ground irrigation: design, installation and smart control.",
    ),
    description: L(
      "Su mənbəyini və təzyiqi yoxlayır, zonalara bölür, boruları torpaq altında aparırıq. İşi bitirəndə sistemi telefonunuzdan idarə etməyi göstəririk.",
      "Проверяем источник и давление воды, делим участок на зоны, прокладываем трубы под землёй. По окончании показываем, как управлять системой с телефона.",
      "We check supply and pressure, split the garden into zones and run pipework underground, then show you how to run it from your phone.",
    ),
    includes: [
      L("Təzyiq ölçümü və zonalaşdırma", "Замер давления и зонирование", "Pressure test and zoning"),
      L("Material və quraşdırma", "Материалы и монтаж", "Materials and installation"),
      L("Kontrollerin qurulması", "Настройка контроллера", "Controller setup"),
      L("1 il xidmət zəmanəti", "Гарантия на работы 1 год", "1-year workmanship warranty"),
    ],
    steps: [
      { title: L("Ölçü", "Замер", "Survey"), text: L("Ərazini və su mənbəyini yoxlayırıq.", "Осматриваем участок и источник воды.", "We survey the site and water source.") },
      { title: L("Layihə və qiymət", "Проект и цена", "Plan & quote"), text: L("Zonalar və dəqiq smeta təqdim edirik.", "Предлагаем зоны и точную смету.", "You get a zone plan and fixed quote.") },
      { title: L("Quraşdırma", "Монтаж", "Install"), text: L("Adətən 1–3 iş günü çəkir.", "Обычно занимает 1–3 рабочих дня.", "Usually takes 1–3 working days.") },
      { title: L("Təhvil", "Сдача", "Handover"), text: L("Sistemi işə salır, idarəetməni öyrədirik.", "Запускаем систему и обучаем управлению.", "We commission it and show you the controls.") },
    ],
    projectSlugs: ["novxani-hovuz"],
  },
  {
    slug: "movsumi-baxim",
    icon: "Leaf",
    image: "pruning",
    recurring: true,
    priceFrom: 120,
    priceUnit: L("ay", "месяц", "per month"),
    name: L("Mövsümi bağ baxımı", "Сезонный уход за садом", "Seasonal garden care"),
    summary: L(
      "Ayda 2–4 gəliş: qayçılama, gübrələmə, dərmanlama, qazon biçimi. Abunə ilə.",
      "2–4 визита в месяц: стрижка, подкормка, обработка, покос газона. По подписке.",
      "2–4 visits a month: pruning, feeding, spraying and mowing. On subscription.",
    ),
    description: L(
      "Sabit bağban komandası həyətinizə müntəzəm gəlir, hər gəlişdən sonra foto hesabat göndərir. Gübrə və dərmanlar paketə daxildir.",
      "Постоянная бригада садовников регулярно приезжает и после каждого визита присылает фотоотчёт. Удобрения и препараты включены.",
      "A dedicated gardening crew visits on a schedule and sends a photo report after each visit. Feed and treatments are included.",
    ),
    includes: [
      L("Qazon biçimi və kənarların düzəldilməsi", "Покос газона и обрезка кромок", "Mowing and edging"),
      L("Kol və ağacların qayçılanması", "Стрижка кустов и деревьев", "Hedge and tree pruning"),
      L("Gübrələmə və dərmanlama", "Подкормка и обработка", "Feeding and spraying"),
      L("Foto hesabat", "Фотоотчёт", "Photo report"),
    ],
    steps: [
      { title: L("Baxış", "Осмотр", "Assess"), text: L("Bağı qiymətləndirir, qulluq planı tuturuq.", "Оцениваем сад и составляем план ухода.", "We assess the garden and draw up a plan.") },
      { title: L("Abunə", "Подписка", "Subscribe"), text: L("Gəliş tezliyini seçirsiniz.", "Вы выбираете частоту визитов.", "You choose how often we visit.") },
      { title: L("Qulluq", "Уход", "Care"), text: L("Komanda cədvəl üzrə gəlir.", "Бригада приезжает по графику.", "The crew comes on schedule.") },
    ],
    projectSlugs: ["sixov-otel"],
  },
];
