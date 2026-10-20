import type { SeasonalMonth } from "@/lib/types";
import { L } from "./_helpers";

/**
 * "Bu ay nə etməli?" — Abşeron iqliminə uyğun aylıq tövsiyələr.
 * Ana səhifə cari aya görə müvafiq ayı avtomatik seçir.
 */
export const seasonal: SeasonalMonth[] = [
  {
    month: 1,
    tips: [
      { world: "garden", title: L("Qış qayçılaması", "Зимняя обрезка", "Winter pruning"), text: L("Meyvə ağaclarının quru və xəstə budaqlarını kəsin — şirə hərəkəti başlamamış.", "Удалите сухие и больные ветви плодовых до начала сокодвижения.", "Remove dead and diseased fruit-tree branches before the sap rises."), productSlugs: ["fungisid-250ml"] },
      { world: "pool", title: L("Su filtrini yoxlayın", "Проверьте фильтр воды", "Check your water filter"), text: L("Qışda ərp daha çox yığılır — kartuşları dəyişmə vaxtını yoxlayın.", "Зимой накипи больше — проверьте срок замены картриджей.", "Scale builds up more in winter — check cartridge dates."), productSlugs: ["kartus-desti-3-merhele", "pp-kartus-5mkm-3lu"] },
      { world: "garden", title: L("Palmaları küləkdən qoruyun", "Защитите пальмы от ветра", "Shield palms from wind"), text: L("Gənc palmaların yarpaqlarını bağlayın, kök zonasını mulçalayın.", "Подвяжите листья молодых пальм и замульчируйте прикорневую зону.", "Tie up young palm fronds and mulch the root zone."), productSlugs: ["sam-qabigi-mulca-60l"] },
    ],
  },
  {
    month: 2,
    tips: [
      { world: "garden", title: L("Torpağı hazırlayın", "Подготовьте почву", "Prepare the soil"), text: L("Yaz əkinindən əvvəl ləklərə torf və üzvi gübrə qatın.", "Перед весенней посадкой внесите в клумбы торф и органику.", "Work peat and organic feed into beds before spring planting."), productSlugs: ["torf-50l", "uzvi-gubre-qranul-10kq"] },
      { world: "garden", title: L("Canlı çit əkini", "Посадка живой изгороди", "Plant a hedge"), text: L("Leylandi və fotiniya üçün ən yaxşı vaxtlardan biridir.", "Одно из лучших времён для лейланди и фотинии.", "One of the best windows for Leyland cypress and photinia."), productSlugs: ["leylandi-1-5m", "fotiniya-red-robin-1m"] },
      { world: "pool", title: L("Hovuz avadanlığını yoxlayın", "Проверьте оборудование", "Service pool equipment"), text: L("Mövsümdən əvvəl nasos və filtrin vəziyyətini yoxlatdırın.", "До сезона проверьте насос и фильтр.", "Get the pump and filter checked before the season."), productSlugs: ["qum-filtri-500mm"] },
    ],
  },
  {
    month: 3,
    tips: [
      { world: "garden", title: L("Yaz gübrələməsi", "Весенняя подкормка", "Spring feeding"), text: L("Azot və balanslı NPK ilə yaşıl kütləni oyadın.", "Пробудите рост азотом и сбалансированным NPK.", "Wake up growth with nitrogen and balanced NPK."), productSlugs: ["universal-gubre-npk-5kq"] },
      { world: "garden", title: L("Damcı suvarmanı qurun", "Установите капельный полив", "Set up drip irrigation"), text: L("İsti günlər başlamamış sistemi hazır edin.", "Подготовьте систему до наступления жары.", "Get the system ready before the heat arrives."), productSlugs: ["damci-suvarma-desti-50", "suvarma-taymeri-1-zona"] },
      { world: "garden", title: L("Topiarları formalaşdırın", "Подстригите топиари", "Shape topiary"), text: L("Şimşad və formalı bitkilərin ilk qayçılaması.", "Первая стрижка самшита и формованных растений.", "First trim of boxwood and shaped plants."), productSlugs: ["simsad-top-50sm"] },
    ],
  },
  {
    month: 4,
    tips: [
      { world: "pool", title: L("Hovuzu açın", "Откройте бассейн", "Open the pool"), text: L("Suyu doldurun, pH-ı tənzimləyin, şok xlorlama edin.", "Наполните бассейн, отрегулируйте pH, проведите шоковое хлорирование.", "Fill up, balance pH and shock-chlorinate."), productSlugs: ["ph-minus-qranul-5kq", "xlor-tabletleri-200q-5kq"] },
      { world: "garden", title: L("Xəstəliklərə qarşı profilaktika", "Профилактика болезней", "Prevent disease"), text: L("Güllər və meyvə ağaclarını fungisidlə çiləyin.", "Обработайте розы и плодовые фунгицидом.", "Spray roses and fruit trees with fungicide."), productSlugs: ["fungisid-250ml"] },
      { world: "garden", title: L("Palma əkini", "Посадка пальм", "Plant palms"), text: L("Torpaq isindi — palmalar üçün ideal vaxt.", "Почва прогрелась — идеальное время для пальм.", "The soil has warmed — ideal for palms."), productSlugs: ["trachycarpus-palma-1-8m", "vasinqton-palma-2-5m"] },
    ],
  },
  {
    month: 5,
    tips: [
      { world: "pool", title: L("Yosunun qarşısını alın", "Не допустите водорослей", "Stay ahead of algae"), text: L("İstilər başlayır — həftəlik algisid əlavə edin.", "Начинается жара — добавляйте альгицид еженедельно.", "Heat is coming — add algaecide weekly."), productSlugs: ["yosun-eleyhine-1l"] },
      { world: "garden", title: L("Mulçalayın", "Замульчируйте", "Mulch beds"), text: L("Mulça yayda nəmi saxlayır, suvarmanı azaldır.", "Мульча сохранит влагу летом и сократит полив.", "Mulch holds moisture through summer and cuts watering."), productSlugs: ["sam-qabigi-mulca-60l"] },
      { world: "garden", title: L("Güllərə qida verin", "Подкормите розы", "Feed roses"), text: L("Çiçəkləmə dövründə kaliumlu maye gübrə.", "Жидкое калийное удобрение в период цветения.", "Potassium-rich liquid feed while flowering."), productSlugs: ["maye-gubre-guller-1l"] },
    ],
  },
  {
    month: 6,
    tips: [
      { world: "pool", title: L("Robot təmizləyiciyə keçin", "Доверьте уборку роботу", "Let a robot clean"), text: L("Mövsümün ən gərgin vaxtında hər gün əl ilə təmizləməyə ehtiyac qalmır.", "В пик сезона не нужно чистить вручную каждый день.", "No more daily hand-cleaning at peak season."), productSlugs: ["robot-supurge-x40"] },
      { world: "garden", title: L("Suvarmanı avtomatlaşdırın", "Автоматизируйте полив", "Automate watering"), text: L("Səhər tezdən suvarma suyu 30%-ə qədər qənaət edir.", "Полив рано утром экономит до 30% воды.", "Early-morning watering saves up to 30% water."), productSlugs: ["agilli-kontroller-wifi-6"] },
      { world: "pool", title: L("Su ehtiyatı", "Запас воды", "Water backup"), text: L("Yay kəsintilərinə qarşı çən və nasos qurun.", "Установите ёмкость с насосом на случай летних отключений.", "Install a tank and pump for summer outages."), productSlugs: ["su-ceni-1000l"] },
    ],
  },
  {
    month: 7,
    tips: [
      { world: "pool", title: L("Xloru tez-tez yoxlayın", "Чаще проверяйте хлор", "Test chlorine often"), text: L("Günəş xloru sürətlə parçalayır — həftədə 2 dəfə test edin.", "Солнце быстро разрушает хлор — тестируйте 2 раза в неделю.", "Sun burns off chlorine fast — test twice a week."), productSlugs: ["xlor-tabletleri-200q-5kq"] },
      { world: "pool", title: L("Bulanıq su", "Мутная вода", "Cloudy water"), text: L("Flokulyant və filtrin əks yuması şəffaflığı qaytarır.", "Флокулянт и обратная промывка вернут прозрачность.", "Flocculant plus a backwash restores clarity."), productSlugs: ["flokulyant-maye-1l"] },
      { world: "garden", title: L("Kölgəsevər bitkiləri qoruyun", "Защитите теневыносливые", "Protect shade plants"), text: L("Maqnoliya və şimşad üçün suvarmanı artırın.", "Увеличьте полив магнолии и самшита.", "Increase watering for magnolia and boxwood."), productSlugs: ["damci-boru-16mm-100m"] },
    ],
  },
  {
    month: 8,
    tips: [
      { world: "pool", title: L("Buxarlanmanı azaldın", "Сократите испарение", "Cut evaporation"), text: L("Gecələr örtük suyu və kimyanı qoruyur.", "Ночью покрытие сохраняет воду и химию.", "A cover at night saves water and chemicals."), productSlugs: ["istilik-ortuyu-8x4"] },
      { world: "garden", title: L("Payız əkinini planlayın", "Планируйте осеннюю посадку", "Plan autumn planting"), text: L("Ting siyahısını indi hazırlayın — ən yaxşı nümunələr tez satılır.", "Составьте список саженцев сейчас — лучшие экземпляры уходят быстро.", "Make your planting list now — the best specimens go fast."), productSlugs: ["tuya-smaragd-1-2m", "leylandi-1-5m"] },
      { world: "pool", title: L("Su filtrinin kartuşları", "Картриджи фильтра", "Filter cartridges"), text: L("Yayda su sərfi artır — kartuşları vaxtında dəyişin.", "Летом расход воды растёт — меняйте картриджи вовремя.", "Summer use is high — swap cartridges on time."), productSlugs: ["kartus-desti-3-merhele"] },
    ],
  },
  {
    month: 9,
    tips: [
      { world: "garden", title: L("Payız gübrələməsi", "Осенняя подкормка", "Autumn feeding"), text: L("Fosfor-kalium kökləri gücləndirir, qışa hazırlayır.", "Фосфор и калий укрепляют корни перед зимой.", "Phosphorus and potassium build roots for winter."), productSlugs: ["uzvi-gubre-qranul-10kq"] },
      { world: "garden", title: L("Yeni qazon zonaları", "Новые зоны газона", "New lawn areas"), text: L("Çiləyici sistemi qazon salınmasından əvvəl qurun.", "Установите дождеватели до укладки газона.", "Install sprinklers before laying turf."), productSlugs: ["rotor-cileyici-desti"] },
      { world: "pool", title: L("Mövsümün sonu", "Конец сезона", "End of season"), text: L("Kimyanı azaldın, filtri dərin yuyun.", "Уменьшите дозы химии и глубоко промойте фильтр.", "Ease off chemicals and deep-clean the filter."), productSlugs: ["flokulyant-maye-1l"] },
    ],
  },
  {
    month: 10,
    tips: [
      { world: "garden", title: L("Ting əkini vaxtıdır", "Время сажать саженцы", "Time to plant"), text: L("Oktyabr ağac və kol əkini üçün ilin ən yaxşı ayıdır — köklər qışa qədər tutur.", "Октябрь — лучший месяц для посадки деревьев и кустарников: корни успеют прижиться до зимы.", "October is the best month for trees and shrubs — roots establish before winter."), productSlugs: ["leylandi-1-5m", "tuya-smaragd-1-2m", "torf-50l"] },
      { world: "pool", title: L("Hovuzu qışa bağlayın", "Закройте бассейн на зиму", "Winterise the pool"), text: L("pH-ı tənzimləyin, şok xlorlama edin, səviyyəni endirin və örtün.", "Отрегулируйте pH, проведите шок-хлорирование, понизьте уровень и накройте.", "Balance pH, shock, lower the level and cover up."), productSlugs: ["ph-minus-qranul-5kq", "xlor-tabletleri-200q-5kq", "istilik-ortuyu-8x4"] },
      { world: "garden", title: L("Qazona payız gübrəsi", "Осенняя подкормка газона", "Autumn lawn feed"), text: L("Kaliumlu gübrə qazonu şaxtaya hazırlayır.", "Калийное удобрение готовит газон к заморозкам.", "Potassium feed readies the lawn for frost."), productSlugs: ["universal-gubre-npk-5kq"] },
    ],
  },
  {
    month: 11,
    tips: [
      { world: "garden", title: L("Meyvə ağacları əkin", "Сажайте плодовые", "Plant fruit trees"), text: L("Sitrus və meyvə tingləri üçün son əlverişli həftələr.", "Последние удачные недели для цитрусовых и плодовых саженцев.", "Last good weeks for citrus and fruit saplings."), productSlugs: ["portagal-agaci-1-2m"] },
      { world: "garden", title: L("Suvarma sistemini boşaldın", "Слейте воду из системы", "Drain irrigation"), text: L("Şaxtadan əvvəl boruları boşaldın, taymerin batareyasını çıxarın.", "Перед заморозками слейте трубы и выньте батарейки из таймера.", "Drain the lines and pull timer batteries before frost."), productSlugs: ["suvarma-taymeri-1-zona"] },
      { world: "garden", title: L("Kök zonasını mulçalayın", "Замульчируйте корни", "Mulch the roots"), text: L("Gənc bitkiləri şaxtadan qoruyur.", "Защитит молодые растения от мороза.", "Protects young plants from frost."), productSlugs: ["sam-qabigi-mulca-60l"] },
    ],
  },
  {
    month: 12,
    tips: [
      { world: "pool", title: L("Ev suyu üçün filtr", "Фильтр для воды в доме", "Filter your tap water"), text: L("Qış — su sisteminə sakit vaxtda filtr qurmaq üçün yaxşı fürsətdir.", "Зима — удобное время спокойно установить фильтр.", "Winter is a good, quiet time to fit a filter."), productSlugs: ["ters-osmos-5-merhele", "magistral-filtr-10"] },
      { world: "garden", title: L("Gələn il üçün layihə", "Проект на следующий год", "Plan next year"), text: L("Landşaft layihəsini qışda hazırlayın, yazda tikintiyə başlayın.", "Подготовьте ландшафтный проект зимой, весной — реализация.", "Design in winter, build in spring."), productSlugs: [] },
      { world: "garden", title: L("Otaq bitkiləri", "Комнатные растения", "Houseplants"), text: L("Qışda suvarmanı azaldın, işıqlı yerə qoyun.", "Зимой сократите полив и поставьте ближе к свету.", "Water less in winter and move them toward the light."), productSlugs: ["maye-gubre-guller-1l"] },
    ],
  },
];
