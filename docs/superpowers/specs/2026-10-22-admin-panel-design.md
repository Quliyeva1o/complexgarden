# Admin paneli — dizayn (v1)

Tarix: 2026-10-22 · Status: təsdiqlənib

## Məqsəd

Mağaza işçiləri kodu dəyişmədən məhsulları və kateqoriyaları idarə etsin, saytdan gələn sifariş və
xidmət sorğularını bir yerdə görsün. Saytın sürəti, görünüşü və SEO-su dəyişməməlidir.

## Qərarlar

| Mövzu | Qərar |
|---|---|
| Məlumat mənbəyi | Supabase: Postgres + Auth + Storage, region Frankfurt |
| Panelin yeri | Eyni Next.js tətbiqi, `/admin` (ayrı root layout, `[locale]`-dən kənarda) |
| Yanaşma | `@supabase/supabase-js` + `@supabase/ssr`; SQL miqrasiyaları repoda (`supabase/migrations`), tiplər bazadan generasiya olunur; təhlükəsizlik RLS ilə |
| v1 əhatəsi | Məhsullar, kateqoriyalar (+ alt kateqoriyalar), sifarişlər, xidmət sorğuları, adminlər |
| v1-dən kənar | Kampaniyalar, ana səhifə, sayt ayarları, xidmətlər, abunələr, məqalələr, məlumat səhifələri, kateqoriya filtrləri (kodda qalır); müştəriyə status bildirişi; bülleten |
| Dillər | AZ, RU, EN — dərc olunan qeyddə üçü də məcburidir; qaralamada boş ola bilər |
| İstifadəçilər | Bir neçə admin, eyni hüquq; hər dəyişiklik `audit_log`-a yazılır |
| Bildiriş | Telegram bot (işçi qrupuna) — yeni sifariş və sorğu |

## 1. Baza

Lokallaşdırılmış mətnlər `jsonb` kimi saxlanır: `{ "az": "", "ru": "", "en": "" }`.

- **categories** — `slug` (PK), `name`, `short_name`, `description`, `guide`, `faq` (jsonb), `world` (`pool|garden`),
  `image`, `active`, `sort_order`, `updated_at`, `updated_by`.
- **subcategories** — `category_slug` (FK), `slug`, `name`, `recurring`, `active`, `sort_order`; PK (`category_slug`, `slug`).
- **products** — `id` (uuid), `slug` (unique), `status` (`draft|published|archived`), `name`, `description`,
  `category_slug`, `subcategory_slug`, `product_type`, `price`, `old_price`, `in_stock`, `lead_time_days`,
  `subscription_eligible`, `brand`, `badges` (text[]), `images` (text[]: Storage yolu və ya tam URL),
  `specs`, `plant_passport`, `dosage`, `installation_service`, `attributes` (jsonb), `warranty_months`,
  `bought_together` (text[]), `rating`, `reviews_count`, `popularity`, `created_at`, `updated_at`, `updated_by`.
- **orders** — `id` (`YYMMDD-XXXX`), `created_at`, `status` (`new|confirmed|delivered|cancelled`), `locale`,
  `customer` (jsonb: ad, telefon, ünvan, bölgə, qeyd), `items` (jsonb snapshot: slug, ad, say, vahid qiyməti, seçimlər),
  `subtotal`, `delivery_fee`, `total`, `admin_note`, `ip_hash`.
- **service_requests** — `id`, `created_at`, `status` (`new|contacted|closed`), `name`, `phone`, `service`, `message`,
  `source_path`, `admin_note`, `ip_hash`.
- **admins** — `user_id` (auth.users FK), `name`, `created_at`.
- **audit_log** — `id`, `at`, `user_id`, `entity` (`product|category|order|request|admin`), `entity_id`, `action`, `changes` (jsonb).

**Bütövlük qaydaları (CHECK / trigger):**
- `status = 'published'` olan məhsulda və aktiv kateqoriyada `name`, `description` (kateqoriyada `name`, `description`)
  üç dildə boş olmamalıdır.
- `price > 0`; `old_price` varsa `> price`.
- Dərc olunmuş məhsulun `slug`-ı dəyişdirilə bilməz.

**RLS:**
- `anon` — yalnız `published` məhsulları və `active` kateqoriya/alt kateqoriyaları oxuyur.
- `orders`, `service_requests` — `anon` üçün heç bir hüquq yoxdur; yazı yalnız server tərəfində (service role) yoxlamadan sonra.
- `admins` cədvəlində olan istifadəçi — bütün cədvəllərdə tam hüquq. `is_admin()` funksiyası ilə.

**Storage:** `product-images` bucket — hamı oxuya bilər, yalnız adminlər yazır/silir.

## 2. Panel (`/admin`, yalnız AZ)

Kompüter üçün qurulur, sifariş/sorğu səhifələri telefonda da rahatdır. Saytın dizayn tokenləri istifadə olunur.
Hər səhifə `noindex`, `robots.txt`-də `Disallow: /admin`, sitemap-də yoxdur.

- `/admin/giris` — e-poçt + şifrə; şifrə bərpası.
- `/admin` — icmal: yeni sifariş/sorğu sayı, stokda olmayan, qaralamalar; son 10 sifariş.
- `/admin/mehsullar` — siyahı (şəkil, ad, kateqoriya, qiymət, stok, status), axtarış, filtrlər; stok və dərc açarı sətirdə.
- `/admin/mehsullar/yeni`, `/admin/mehsullar/[id]` — forma: əsas, qiymət və stok, şəkillər (yükləmə, sıralama, silmə;
  yükləmədən əvvəl brauzerdə kiçiltmə), təsvir və xüsusiyyətlər (dil tabları + doluluq işarəsi), növə görə bölmə
  (bitki pasportu / doza / quraşdırma + zəmanət), "birlikdə alınır" seçimi. Düymələr: Qaralama kimi saxla, Dərc et,
  Saytda bax, Arxivə göndər.
- `/admin/kateqoriyalar` (+ `[slug]`) — sürüşdürərək sıralama, aktiv açarı; forma + alt kateqoriyalar.
- `/admin/sifarisler` (+ `[id]`) — status filtri, nömrə/telefon axtarışı; detal: məhsullar, müştəri, WhatsApp/zəng, status, daxili qeyd.
- `/admin/sorgular` (+ `[id]`) — eyni quruluş.
- `/admin/adminler` — e-poçtla dəvət, çıxarma.
- Hər məhsul/kateqoriya/sifariş səhifəsində "Tarixçə" (`audit_log`).

Bütün yazılar Server Actions ilə; hər action əvvəlcə sessiyanı və `is_admin`-i yoxlayır, girişi zod ilə doğrulayır.

## 3. Saytın oxuması və yenilənməsi

- `lib/data/supabase.ts` — `CatalogRepository`-ni həyata keçirir. `lib/data/index.ts` mühit dəyişənləri varsa onu,
  yoxdursa `localRepository`-ni seçir.
- Dərc olunmuş məhsullar və aktiv kateqoriyalar bir sorğu ilə gətirilir, cache-lənir; filtr/axtarış/saylar mövcud
  `query.ts` məntiqi ilə yaddaşda işləyir (bir neçə min məhsula qədər kifayətdir).
- Oxumalar `"use cache"` + `cacheTag` (`catalog`, `product:<slug>`, `categories`) ilə. Admin yazısından sonra uyğun
  teqlər yenilənir. Dəqiq API (`updateTag` / `revalidateTag`) Next 16 sənədlərindən (`node_modules/next/dist/docs`)
  tətbiqdən əvvəl yoxlanılır.
- Kodda qalan məzmun (kampaniyalar, xidmətlər və s.) `localRepository`-dən oxunmağa davam edir.
- Sitemap bazadan qurulur. `next/image` üçün Supabase Storage hostu `remotePatterns`-ə əlavə olunur.
- Supabase əlçatmaz olsa, cache-dəki səhifələr göstərilir.

## 4. Sifariş və sorğu axını

1. Checkout forması Server Action-a göndərilir.
2. Server qiymətləri bazadan yenidən hesablayır (`lib/cart/pricing.ts`), məhsulun dərc olunduğunu və stokda olduğunu
   yoxlayır, sifarişi yazır.
3. Müştəri təsdiq səhifəsini görür (nömrə, məbləğ, "WhatsApp-da təsdiqlə"); telefonda WhatsApp avtomatik açılır.
   Səbət təmizlənir.
4. Bazaya yazmaq alınmasa, köhnə axın (birbaşa WhatsApp) işləyir — sifariş itmir.
5. Telegram bildirişi `after()` ilə cavabdan sonra göndərilir; uğursuzluq sifarişə təsir etmir.

Spam: görünməz honeypot sahəsi + IP-hash üzrə qısa müddətli limit (məs. 10 dəqiqədə 5 sifariş).
Xidmət sorğusu eyni yolla: baza → Telegram → müştəriyə WhatsApp təklifi.

## 5. Köçürmə və SEO qaydaları

- `scripts/seed-supabase.ts` — `data/categories.ts` və `data/products/*` məlumatlarını upsert edir (slug üzrə,
  təkrar işə salmaq təhlükəsizdir). Hamısı `published`. Şəkillər hələlik mövcud kənar URL-lərlə.
- Dərc olunmuş məhsulun slug-ı kilidlidir. Silmə = `archived` (saytdan çıxır, sifarişlərdə qalır, bərpa olunur).

## 6. Mərhələlər

1. Supabase: miqrasiyalar, RLS, Storage, seed.
2. Sayt bazadan oxuyur — görünüş eyni; bütün səhifələr, filtrlər, SEO yoxlanılır.
3. Giriş, panelin karkası, icmal, adminlər.
4. Məhsullar və kateqoriyalar CRUD, şəkillər, yenilənmə.
5. Sifarişlər, sorğular, Telegram.
6. Testlər (qiymət hesablaması, validasiya, RLS — `anon` yaza bilmir), axe, Lighthouse (bugünkü səviyyə).

## Lazım olanlar

- Supabase layihəsi: Project URL, anon key (`NEXT_PUBLIC_*`), service role key (yalnız `.env.local`, chat-a yazılmır).
- Telegram: bot token və qrup chat id (`.env.local`), 5-ci mərhələdən əvvəl.
