import type { Localized } from "@/lib/types";
import { L } from "./_helpers";

/**
 * Məlumat səhifələrinin məzmunu. Mətndəki {threshold}, {fee}, {discount} yerləri
 * config/site.ts-dəki dəyərlərlə əvəz olunur — həddi dəyişəndə mətn də yenilənir.
 */

export interface InfoSection {
  title: Localized;
  body: Localized[];
}

export interface InfoPage {
  slug: "about" | "delivery" | "returns";
  title: Localized;
  lead: Localized;
  sections: InfoSection[];
}

export const infoPages: InfoPage[] = [
  {
    slug: "about",
    title: L("Haqqımızda", "О нас", "About us"),
    lead: L(
      "Bakıda hovuz kimyası ilə başlayan kiçik mağaza bu gün həyət, bağ və hovuz üçün hər şeyi bir yerdə təklif edir — öz tingliyimiz, quraşdırma komandamız və abunə xidmətimizlə.",
      "Небольшой магазин химии для бассейнов в Баку сегодня предлагает всё для двора, сада и бассейна в одном месте — с собственным питомником, командой монтажа и подпиской.",
      "What began as a small pool-chemicals shop in Baku now offers everything for yard, garden and pool in one place — with our own nursery, installation team and subscriptions.",
    ),
    sections: [
      {
        title: L("Nə edirik", "Чем мы занимаемся", "What we do"),
        body: [
          L(
            "Villa və həyət evi sahiblərinə, otellərə, SPA mərkəzlərinə və landşaft şirkətlərinə hovuz avadanlığı və kimyası, bitkilər, suvarma sistemləri və su təmizləmə həlləri təklif edirik.",
            "Мы поставляем оборудование и химию для бассейнов, растения, системы полива и водоочистку владельцам вилл и частных домов, отелям, SPA-центрам и ландшафтным компаниям.",
            "We supply pool equipment and chemicals, plants, irrigation and water treatment to villa and house owners, hotels, spas and landscaping companies.",
          ),
          L(
            "Məhsulların bir hissəsi Bakıdakı anbarımızdadır, bir hissəsi isə etibarlı tədarükçülərdən sifarişlə gətirilir — hər məhsul səhifəsində çatdırılma müddəti açıq yazılır.",
            "Часть товаров хранится на нашем складе в Баку, часть привозится под заказ от проверенных поставщиков — срок доставки указан на странице каждого товара.",
            "Part of the range is held in our Baku warehouse and part is ordered in from trusted suppliers — every product page states the delivery time.",
          ),
        ],
      },
      {
        title: L("Öz tingliyimiz", "Собственный питомник", "Our own nursery"),
        body: [
          L(
            "Leylandi, tuya, fotiniya, palmalar və meyvə tingləri öz tingliyimizdə yetişdirilir və Abşeron iqliminə uyğunlaşdırılır. Əkin xidmətimizlə alınan bitkilərə 3 ay tutma zəmanəti veririk.",
            "Лейланди, туи, фотинии, пальмы и плодовые саженцы выращиваются в нашем питомнике и адаптированы к климату Апшерона. На растения с нашей посадкой даём гарантию приживаемости 3 месяца.",
            "Leyland cypress, thuja, photinia, palms and fruit saplings are grown in our nursery and acclimatised to Absheron. Plants we install carry a 3-month survival guarantee.",
          ),
        ],
      },
      {
        title: L("Necə işləyirik", "Как мы работаем", "How we work"),
        body: [
          L(
            "Satışla bitmir: seçməyə kömək edirik, gətiririk, quraşdırırıq və sonra da əlaqədə qalırıq. Təkrar lazım olan məhsulları abunə ilə vaxtında çatdırırıq ki, hovuz dərmanı və ya filtr kartuşu yarı yolda bitməsin.",
            "Продажей дело не заканчивается: помогаем выбрать, привозим, устанавливаем и остаёмся на связи. Расходники доставляем по подписке, чтобы химия или картриджи не заканчивались внезапно.",
            "It doesn't end at the sale: we help you choose, deliver, install and stay in touch. Refills arrive on subscription so chemicals and cartridges never run out mid-season.",
          ),
        ],
      },
    ],
  },
  {
    slug: "delivery",
    title: L("Çatdırılma", "Доставка", "Delivery"),
    lead: L(
      "Bakı və Abşeron daxilində öz kuryerlərimizlə çatdırırıq. {threshold} ₼-dan yuxarı sifarişlərdə çatdırılma pulsuzdur.",
      "Доставляем по Баку и Апшерону своими курьерами. Заказы от {threshold} ₼ доставляем бесплатно.",
      "We deliver across Baku and Absheron with our own couriers. Orders over {threshold} ₼ ship free.",
    ),
    sections: [
      {
        title: L("Müddət", "Сроки", "Timing"),
        body: [
          L("Stokdakı məhsullar 1–2 iş günü ərzində çatdırılır. Seçdiyiniz gün və vaxt aralığında (10:00–14:00, 14:00–18:00, 18:00–21:00) gəlirik.", "Товары в наличии доставляем за 1–2 рабочих дня — в выбранный день и интервал (10:00–14:00, 14:00–18:00, 18:00–21:00).", "In-stock items arrive within 1–2 working days, on the day and in the window you choose (10:00–14:00, 14:00–18:00, 18:00–21:00)."),
          L("Sifarişlə gələn məhsulların müddəti məhsul səhifəsində yazılır (adətən 5–10 gün). Hazır olanda zəng edib çatdırılma gününü razılaşdırırıq.", "Срок для товаров под заказ указан на странице товара (обычно 5–10 дней). Когда товар готов, позвоним и согласуем день.", "Made-to-order lead times are shown on each product page (usually 5–10 days). We call to agree a day once it arrives."),
        ],
      },
      {
        title: L("Qiymət", "Стоимость", "Cost"),
        body: [
          L("Bakı daxilində {threshold} ₼-dan yuxarı sifarişlər pulsuz, qalan sifarişlər {fee} ₼. Abşeron rayonu və Sumqayıt üçün qiymət sifariş təsdiqlənəndə bildirilir.", "По Баку заказы от {threshold} ₼ — бесплатно, остальные — {fee} ₼. Стоимость для Абшерона и Сумгаита сообщим при подтверждении.", "Within Baku orders over {threshold} ₼ are free, others cost {fee} ₼. Absheron district and Sumgait are quoted when we confirm."),
          L("Böyük ağaclar, palmalar və torpaq kimi ağır yüklər üçün xüsusi nəqliyyat lazımdırsa, operator əvvəlcədən xəbər verir.", "Если для крупных деревьев, пальм или грунта нужен спецтранспорт, оператор предупредит заранее.", "If large trees, palms or bulk soil need special transport, the operator lets you know in advance."),
        ],
      },
      {
        title: L("Quraşdırma və əkin", "Установка и посадка", "Installation and planting"),
        body: [
          L("Məhsul səhifəsində əkin və ya quraşdırma xidmətini seçmisinizsə, usta çatdırılma günü gəlir və işi həmin gün bitirir.", "Если на странице товара выбрана посадка или установка, мастер приезжает в день доставки и завершает работу в тот же день.", "If you added planting or installation on the product page, our technician comes on delivery day and finishes the job the same day."),
        ],
      },
    ],
  },
  {
    slug: "returns",
    title: L("Qaytarma və zəmanət", "Возврат и гарантия", "Returns & warranty"),
    lead: L(
      "İstifadə olunmamış məhsulu 14 gün ərzində qaytara bilərsiniz. Avadanlığa istehsalçının rəsmi zəmanəti şamil olunur.",
      "Неиспользованный товар можно вернуть в течение 14 дней. На оборудование действует официальная гарантия производителя.",
      "Unused items can be returned within 14 days. Equipment is covered by the manufacturer's official warranty.",
    ),
    sections: [
      {
        title: L("Qaytarma", "Возврат", "Returns"),
        body: [
          L("Məhsul istifadə olunmayıbsa və qablaşdırması açılmayıbsa, 14 gün ərzində qaytarıla və ya dəyişdirilə bilər. Bizə yazın — kuryer məhsulu götürəcək.", "Неиспользованный товар в целой упаковке можно вернуть или обменять в течение 14 дней. Напишите нам — курьер заберёт товар.", "Unused items in unopened packaging can be returned or exchanged within 14 days. Message us and a courier will collect it."),
          L("Açılmış kimyəvi maddələr, əkilmiş bitkilər və sifarişlə xüsusi gətirilmiş məhsullar qaytarılmır.", "Не подлежат возврату вскрытая химия, высаженные растения и товары, привезённые под индивидуальный заказ.", "Opened chemicals, planted plants and special-order items cannot be returned."),
        ],
      },
      {
        title: L("Zəmanət", "Гарантия", "Warranty"),
        body: [
          L("Nasos, filtr, robot-süpürgə, kontroller və su təmizləmə sistemlərinə istehsalçının rəsmi zəmanəti verilir (müddət məhsul səhifəsində yazılır). Servisi öz ustalarımız göstərir.", "На насосы, фильтры, роботы, контроллеры и системы водоочистки действует официальная гарантия производителя (срок указан на странице товара). Сервис выполняют наши мастера.", "Pumps, filters, robots, controllers and water systems carry the manufacturer's official warranty (term shown on the product page). Our own technicians handle service."),
          L("Bizim əkdiyimiz bitkilərə 3 ay tutma zəmanəti var: bitki quruyarsa, pulsuz əvəz edirik.", "На растения, посаженные нами, — гарантия приживаемости 3 месяца: если растение погибнет, заменим бесплатно.", "Plants we install have a 3-month survival guarantee: if one fails, we replace it free."),
        ],
      },
      {
        title: L("Pulun qaytarılması", "Возврат денег", "Refunds"),
        body: [
          L("Nağd ödənişdə məbləğ kuryerə, kartla ödənişdə isə 3–5 iş günü ərzində karta qaytarılır.", "При оплате наличными деньги возвращает курьер, при оплате картой — на карту в течение 3–5 рабочих дней.", "Cash payments are refunded by the courier; card payments are refunded to the card within 3–5 working days."),
        ],
      },
    ],
  },
];

export interface FaqGroup {
  title: Localized;
  items: { q: Localized; a: Localized }[];
}

export const faqGroups: FaqGroup[] = [
  {
    title: L("Sifariş və ödəniş", "Заказ и оплата", "Orders & payment"),
    items: [
      { q: L("Necə sifariş verə bilərəm?", "Как оформить заказ?", "How do I order?"), a: L("Məhsulları səbətə atın və checkout-da \"WhatsApp ilə təsdiqlə\" düyməsini basın — sifariş hazır mesaj kimi açılır. Operator zəng edib təsdiqləyir.", "Добавьте товары в корзину и нажмите «Подтвердить в WhatsApp» — заказ откроется готовым сообщением. Оператор перезвонит и подтвердит.", "Add items to the cart and press \"Confirm via WhatsApp\" at checkout — the order opens as a ready message and an operator calls to confirm.") },
      { q: L("Hansı ödəniş üsulları var?", "Какие способы оплаты?", "Which payment methods?"), a: L("Hazırda qapıda nağd və ya kartla ödəniş. Onlayn kartla ödəniş tezliklə əlavə olunacaq.", "Сейчас — наличными или картой курьеру. Онлайн-оплата картой появится в ближайшее время.", "Currently cash or card on delivery. Online card payment is coming soon.") },
    ],
  },
  {
    title: L("Çatdırılma", "Доставка", "Delivery"),
    items: [
      { q: L("Çatdırılma nə qədər çəkir?", "Сколько идёт доставка?", "How long does delivery take?"), a: L("Stokdakı məhsullar Bakı daxilində 1–2 iş günü. Sifarişlə gələnlərin müddəti məhsul səhifəsində yazılır.", "Товары в наличии — 1–2 рабочих дня по Баку. Срок для товаров под заказ указан на странице товара.", "In-stock items take 1–2 working days in Baku. Made-to-order lead times are on each product page.") },
      { q: L("Çatdırılma pulsuzdurmu?", "Доставка бесплатная?", "Is delivery free?"), a: L("Bakı daxilində {threshold} ₼-dan yuxarı sifarişlərdə pulsuz, qalan hallarda {fee} ₼.", "По Баку — бесплатно от {threshold} ₼, иначе {fee} ₼.", "Free in Baku over {threshold} ₼, otherwise {fee} ₼.") },
    ],
  },
  {
    title: L("Abunə", "Подписка", "Subscription"),
    items: [
      { q: L("Abunə necə işləyir?", "Как работает подписка?", "How does a subscription work?"), a: L("Məhsul səhifəsində \"Abunə\" və tezliyi seçirsiniz — məhsul {discount}% ucuz və seçdiyiniz tezliklə gətirilir. İstənilən vaxt dayandıra bilərsiniz.", "Выберите «Подписку» и периодичность на странице товара — товар дешевле на {discount}% и приезжает с выбранной частотой. Остановить можно в любой момент.", "Choose \"Subscribe\" and a frequency on the product page — the item is {discount}% cheaper and arrives on schedule. Pause any time.") },
      { q: L("Abunəni necə dayandırım?", "Как остановить подписку?", "How do I stop a subscription?"), a: L("WhatsApp-da yazın və ya zəng edin — növbəti çatdırılmadan əvvəl dayandırırıq, heç bir cərimə yoxdur.", "Напишите в WhatsApp или позвоните — остановим до следующей доставки, без штрафов.", "Message us on WhatsApp or call — we stop it before the next delivery, no penalty.") },
    ],
  },
  {
    title: L("Bitkilər və quraşdırma", "Растения и установка", "Plants & installation"),
    items: [
      { q: L("Bitkini siz əkirsiniz?", "Вы сажаете растения?", "Do you plant them?"), a: L("Bəli, məhsul səhifəsində \"Əkin xidməti\"ni seçin. Bizim əkdiyimiz bitkilərə 3 ay tutma zəmanəti verilir.", "Да, отметьте «Посадку» на странице товара. На растения с нашей посадкой — гарантия приживаемости 3 месяца.", "Yes — tick \"Planting service\" on the product page. Plants we install carry a 3-month survival guarantee.") },
      { q: L("Avadanlığı quraşdırırsınız?", "Устанавливаете оборудование?", "Do you install equipment?"), a: L("Filtr, nasos, suvarma sistemi və su təmizləmə qurğularını öz ustalarımız quraşdırır və işə salır.", "Фильтры, насосы, системы полива и водоочистки устанавливают и запускают наши мастера.", "Our own technicians install and commission filters, pumps, irrigation and water systems.") },
    ],
  },
];
