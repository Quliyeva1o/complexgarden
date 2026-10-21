# Son yoxlama (10-cu mərhələ) — 2026-10-21

## Nə yoxlanıldı
| Yoxlama | Alət | Nəticə |
|---|---|---|
| Overflow, tək H1, alt mətnlər, konsol xətaları | Playwright, 28 səhifə × AZ/RU/EN × 390/768/1024/1440 (224 baxış) | Problem yoxdur |
| Əlçatanlıq (WCAG 2.1 AA + best practice) | axe-core, 21 səhifə × 2 tema × 1440/390 | Pozuntu yoxdur |
| Lighthouse (production build) | Lighthouse 12 | Desktop: perf 98–99, a11y/best/SEO 100 |
| Tip, lint, məlumat | `tsc`, `eslint`, `npm run validate:data` | Təmiz |

Lighthouse mobil (simulyasiya olunmuş yavaş 4G + 4× CPU; test kompüteri gözləniləndən yavaşdır, Lighthouse özü xəbərdarlıq edir):
ana səhifə 56, kateqoriya ~70, məhsul ~80, FAQ ~80. Əlçatanlıq/SEO/best practices hər yerdə 100.
Real ünvana yerləşdirildikdən sonra PageSpeed Insights ilə yenidən ölçülməlidir.

## Tapılıb düzəldilənlər
1. **SEO:** `sitemap.xml` (58 səhifə × 3 dil, hreflang), `robots.txt`, hər səhifədə canonical + hreflang (x-default → AZ) + Open Graph; alt səhifələr ana səhifənin hreflang-ını miras alırdı.
2. **Sayt ünvanı** kodda sabit idi → `NEXT_PUBLIC_SITE_URL` (bax `.env.example`).
3. **Kontrast:** footer-dəki iri dekorativ brend adı mətn kimi ölçülürdü → CSS pseudo-element; mobil kampaniya stikerində ağ mətn lime fonda idi.
4. **Scroll animasiyası** görünməyən bölmələri `opacity: 0` saxlayırdı (kontrast yoxlamaları uğursuz) → yalnız sürüşmə.
5. **Mobil LCP heç qeydə alınmırdı:** `scroll-snap` siyahıları (kateqoriyalar, rəylər) ilk render-dən əvvəl özü-özünü sürüşdürürdü, Chrome bunu sürüşmə sayıb LCP-ni dayandırırdı → `scroll-padding`.
6. **Əlçatanlıq:** header landmark və "Əsas məzmuna keç" linki yox idi; ulduz reytinqində ARIA xətası; səbət linkinin adı görünən mətnlə uyğun deyildi; fırlanan nişan; rəy karuseli klaviatura ilə sürüşmürdü; başlıq ardıcıllığı (h1 → h3); iki axtarış formasının adı eyni idi.
7. **Planşet (768px):** abunə kartlarında düymə kartdan çıxırdı → 3 sütun yalnız 1024px-dən.
8. **Loqo:** `public/brand`-a köçürüldü, kənar boşluqlar kəsildi, ekran ölçüsünə uyğun yüklənir (əvvəl 1920px); favicon-lar `public/icons`-da; manifest əlavə olundu.
9. **Palitra loqoya uyğunlaşdırıldı:** primary `#153D2E`, secondary `#05697B` (AA keçir).
10. Client-ə göndərilən tərcümələrdən yalnız serverdə lazım olanlar çıxarıldı.

## Sınaqdan keçirilib geri qaytarılan
- Kiril şriftini ayrıca, preload-suz yükləmək + variable Inter Tight: şrift həcmi 300 KB → 527 KB artdı, mobil nəticə pisləşdi.

## Yerləşdirmədən əvvəl sizdən lazım olanlar
- `NEXT_PUBLIC_SITE_URL` — real domen.
- `config/site.ts`: telefon, WhatsApp, e-poçt, ünvan, koordinatlar, sosial şəbəkə linkləri, `FREE_DELIVERY_THRESHOLD_AZN`.
- Real məhsul şəkilləri (`config/images.ts`), qiymətlər və məlumat səhifələrinin mətnləri (`data/`).
- Formalar (sorğu, bülleten) hələ heç yerə göndərmir; sifariş WhatsApp mesajı ilə təsdiqlənir.
