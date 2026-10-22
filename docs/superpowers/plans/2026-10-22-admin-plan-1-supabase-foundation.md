# Admin Plan 1 — Supabase foundation + site reads from DB

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the Supabase schema (catalog, orders, requests, admins, audit, storage), copy the current catalog into it, and switch the public site to read categories/products from Supabase with tag-based caching — the site must look and behave exactly as today.

**Architecture:** SQL migrations live in `supabase/migrations`. Pure mapping functions convert between DB rows (snake_case, `jsonb` localized text) and the existing `Category`/`Product` types. Catalog logic shared by both data sources moves into `lib/data/catalog-core.ts`; `localRepository` and the new `supabaseRepository` both build on it. `lib/data/index.ts` picks Supabase when env vars exist, otherwise the local files. Supabase reads run inside `"use cache"` with `cacheTag("catalog")`, so later admin saves can call `updateTag("catalog")`.

**Tech Stack:** Next.js 16.4 (cacheComponents), `@supabase/supabase-js` 2.x, `server-only`, Vitest 5, tsx (scripts), Supabase CLI via `npx supabase`.

**Spec:** `docs/superpowers/specs/2026-10-22-admin-panel-design.md` (sections 1, 3, 5, 6 steps 1–2)

This is plan 1 of 4. Later plans: 2 — auth + admin shell; 3 — products/categories CRUD + images; 4 — orders, requests, Telegram, final QA.

## Global Constraints

- Localized text in DB is `jsonb` `{ "az": "", "ru": "", "en": "" }`; published products / active categories must have all three non-empty (DB CHECK).
- Product slug format `^[a-z0-9]+(-[a-z0-9]+)*$`; a published product's slug cannot change (DB trigger).
- Order id format `YYMMDD-XXXX` (`XXXX` = 4 uppercase hex chars, as generated in `components/cart/CheckoutView.tsx:158`).
- `anon` may only SELECT published products, active categories and their subcategories. No anon writes anywhere.
- "Automatically expose new tables" is OFF on the project → every grant is explicit in the migration.
- Env names: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` (secret only in `.env.local`, never committed, never in chat).
- Without the two public env vars the site must keep working from `/data` (local repository).
- Category filter definitions stay in code (`data/categories.ts`), merged by slug.
- UI text is Azerbaijani; code comments follow the repo's Azerbaijani style.
- Never run `next build` while `next dev` is running (stale CSS issue). Do not commit `.env.local`.

---

## File structure

| File | Responsibility |
|---|---|
| `vitest.config.ts` | Test runner config (`@/` alias, node env) |
| `config/images.ts` (modify) | `ImageRef` type; `img()` resolves image keys, absolute URLs and Storage paths |
| `lib/types.ts` (modify) | `Product.images: ImageRef[]`, `Category.image: ImageRef` |
| `supabase/migrations/20261022000000_init.sql` | Schema, constraints, triggers, RLS, grants, storage bucket |
| `lib/supabase/rows.ts` | Row interfaces mirroring the migration |
| `lib/supabase/mappers.ts` | `rowToCategory`, `rowToProduct`, `categoryToRows`, `productToRow` |
| `lib/supabase/env.ts` | Reads/validates Supabase env vars |
| `lib/supabase/public.ts` | Cookie-less anon client for cached public reads |
| `lib/supabase/service.ts` | `server-only` secret-key client (scripts + server actions) |
| `lib/data/catalog-core.ts` | Product/category logic shared by both repositories |
| `lib/data/local.ts` (modify) | Built on `catalog-core` |
| `lib/data/supabase.ts` | `supabaseRepository`: cached Supabase load + `catalog-core` + local content |
| `lib/data/index.ts` (modify) | Chooses repository by env |
| `scripts/seed-supabase.ts` | Upserts `/data` categories + products |
| `scripts/check-rls.ts` | Verifies anon can read published only and cannot write |
| `next.config.ts` (modify) | Supabase Storage host in `images.remotePatterns` |
| `.env.example` (modify) | Document new env vars |
| `tests/**` | Vitest tests |

---

### Task 1: Test runner + image references that accept URLs and Storage paths

**Files:**
- Create: `vitest.config.ts`, `tests/config/images.test.ts`
- Modify: `package.json` (scripts, devDeps), `config/images.ts:67-71`, `lib/types.ts:67,112`

**Interfaces:**
- Produces: `type ImageRef = ImageKey | (string & {})`; `img(ref: ImageRef): string`; `PRODUCT_IMAGES_BUCKET = "product-images"` (exported from `config/images.ts`).

- [ ] **Step 1: Install Vitest**

Run: `npm i -D vitest@5`
Then add to `package.json` scripts: `"test": "vitest run"`.

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./", import.meta.url)) } },
  test: { environment: "node", include: ["tests/**/*.test.ts"] },
});
```

- [ ] **Step 3: Write the failing test** — `tests/config/images.test.ts`

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { images, img } from "@/config/images";

describe("img()", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("resolves a known image key", () => {
    expect(img("poolResort")).toBe(images.poolResort);
  });

  it("returns absolute URLs unchanged", () => {
    expect(img("https://cdn.example.com/a.jpg")).toBe("https://cdn.example.com/a.jpg");
  });

  it("turns a Storage path into a public Supabase URL", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abc.supabase.co");
    expect(img("products/xlor/1.webp")).toBe(
      "https://abc.supabase.co/storage/v1/object/public/product-images/products/xlor/1.webp",
    );
  });

  it("strips a leading slash from Storage paths", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abc.supabase.co");
    expect(img("/p/1.webp")).toBe("https://abc.supabase.co/storage/v1/object/public/product-images/p/1.webp");
  });
});
```

- [ ] **Step 4: Run to see it fail**

Run: `npx vitest run tests/config/images.test.ts`
Expected: FAIL — absolute URL / Storage path cases return `undefined`.

- [ ] **Step 5: Implement** — replace `config/images.ts:67-71` with:

```ts
export type ImageKey = keyof typeof images;

/** Şəkil istinadı: `images` açarı, tam URL və ya Supabase Storage yolu (admin paneldən yüklənən) */
export type ImageRef = ImageKey | (string & {});

export const PRODUCT_IMAGES_BUCKET = "product-images";

export function img(ref: ImageRef): string {
  if (ref in images) return images[ref as ImageKey];
  if (/^https?:\/\//.test(ref)) return ref;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const path = ref.replace(/^\/+/, "");
  return base ? `${base}/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/${path}` : `/${path}`;
}
```

In `lib/types.ts` change the import to `import type { ImageKey, ImageRef } from "@/config/images";`, line 67 (`Category.image`) to `image: ImageRef;` and line 112 (`Product.images`) to `images: ImageRef[];`.

- [ ] **Step 6: Run tests, typecheck, lint**

Run: `npx vitest run && npx tsc --noEmit && npx eslint . --quiet`
Expected: 4 passed; no type or lint errors.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vitest.config.ts tests/config/images.test.ts config/images.ts lib/types.ts
git commit -m "feat: image refs accept URLs and Supabase Storage paths; add vitest"
```

---

### Task 2: Extract shared catalog logic (behaviour-preserving refactor)

**Files:**
- Create: `lib/data/catalog-core.ts`, `tests/data/catalog-core.test.ts`
- Modify: `lib/data/local.ts`

**Interfaces:**
- Produces:
  ```ts
  export interface CatalogSnapshot { categories: Category[]; products: Product[] }
  export type CatalogMethods = Pick<CatalogRepository,
    "getCategories" | "getCategory" | "getProducts" | "getProduct" | "getProductsBySlugs" |
    "getBestsellers" | "getRelatedProducts" | "searchProducts" | "getBrands" | "getProductCounts">;
  export function createCatalogMethods(load: () => Promise<CatalogSnapshot>): CatalogMethods;
  ```
  `localRepository` keeps its exact public behaviour.

- [ ] **Step 1: Write characterization tests against today's `localRepository`** — `tests/data/catalog-core.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { categories } from "@/data/categories";
import { products } from "@/data/products";
import { createCatalogMethods } from "@/lib/data/catalog-core";
import { localRepository } from "@/lib/data/local";
import type { Category, Product } from "@/lib/types";

describe("localRepository (characterization)", () => {
  it("returns only active categories, sorted by order", async () => {
    const list = await localRepository.getCategories();
    expect(list.every((c) => c.active)).toBe(true);
    expect(list.map((c) => c.order)).toEqual([...list.map((c) => c.order)].sort((a, b) => a - b));
  });

  it("counts products per active category", async () => {
    const counts = await localRepository.getProductCounts();
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    expect(total).toBe((await localRepository.getProducts()).length);
  });

  it("finds a product by slug and searches by name", async () => {
    const first = products[0];
    expect((await localRepository.getProduct(first.slug))?.slug).toBe(first.slug);
    const hits = await localRepository.searchProducts(first.name.az.slice(0, 5), "az");
    expect(hits.some((p) => p.slug === first.slug)).toBe(true);
  });
});

describe("createCatalogMethods", () => {
  const base = categories.find((c) => c.active && c.subcategories.length > 0)!;
  const sub = base.subcategories[0];
  const category: Category = { ...base, subcategories: [{ ...sub, active: false }] };
  const product = (slug: string, extra: Partial<Product> = {}): Product => ({
    ...products[0],
    slug,
    categorySlug: category.slug,
    subcategorySlug: undefined,
    ...extra,
  });
  const inactiveCategory: Category = { ...category, slug: "gizli", active: false };
  const methods = createCatalogMethods(async () => ({
    categories: [category, inactiveCategory],
    products: [
      product("gorunen"),
      product("gizli-alt", { subcategorySlug: sub.slug }),
      product("gizli-kat", { categorySlug: "gizli" }),
    ],
  }));

  it("hides products in inactive categories and inactive subcategories", async () => {
    expect((await methods.getProducts()).map((p) => p.slug)).toEqual(["gorunen"]);
  });

  it("does not return inactive categories", async () => {
    expect(await methods.getCategory("gizli")).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run to see it fail**

Run: `npx vitest run tests/data/catalog-core.test.ts`
Expected: FAIL — `Cannot find module '@/lib/data/catalog-core'` (the characterization block would pass on its own).

- [ ] **Step 3: Create `lib/data/catalog-core.ts`** — move the catalog methods out of `local.ts`, parameterised by a loader:

```ts
import type { Category, Product } from "@/lib/types";
import { applyProductQuery, sortProducts } from "./query";
import type { CatalogRepository } from "./repository";

/** Kataloqun bir anlıq görüntüsü: mənbədən (fayl və ya Supabase) gələn kateqoriya və məhsullar */
export interface CatalogSnapshot {
  categories: Category[];
  products: Product[];
}

export type CatalogMethods = Pick<
  CatalogRepository,
  | "getCategories"
  | "getCategory"
  | "getProducts"
  | "getProduct"
  | "getProductsBySlugs"
  | "getBestsellers"
  | "getRelatedProducts"
  | "searchProducts"
  | "getBrands"
  | "getProductCounts"
>;

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;

function normalize(value: string): string {
  return value.toLocaleLowerCase("az").normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

/** Yalnız aktiv kateqoriya və aktiv alt kateqoriyadakı məhsullar satışdadır */
function visibleProducts({ categories, products }: CatalogSnapshot): Product[] {
  const active = new Map(categories.filter((c) => c.active).map((c) => [c.slug, c]));
  return products.filter((p) => {
    const category = active.get(p.categorySlug);
    if (!category) return false;
    if (!p.subcategorySlug) return true;
    const sub = category.subcategories.find((s) => s.slug === p.subcategorySlug);
    return sub?.active !== false;
  });
}

/** Kateqoriya/məhsul məntiqi — hər iki məlumat mənbəyi üçün eyni */
export function createCatalogMethods(load: () => Promise<CatalogSnapshot>): CatalogMethods {
  const visible = async () => visibleProducts(await load());

  return {
    async getCategories(options) {
      const { categories } = await load();
      const list = options?.includeInactive ? categories : categories.filter((c) => c.active);
      return [...list].sort(byOrder);
    },

    async getCategory(slug) {
      const { categories } = await load();
      return categories.find((c) => c.slug === slug && c.active);
    },

    async getProducts(query = {}) {
      const snapshot = await load();
      const category = query.categorySlug
        ? snapshot.categories.find((c) => c.slug === query.categorySlug)
        : undefined;
      return applyProductQuery(visibleProducts(snapshot), query, category);
    },

    async getProduct(slug) {
      return (await visible()).find((p) => p.slug === slug);
    },

    async getProductsBySlugs(slugs) {
      const list = await visible();
      return slugs
        .map((slug) => list.find((p) => p.slug === slug))
        .filter((p): p is Product => Boolean(p));
    },

    async getBestsellers(limit = 8) {
      const list = (await visible()).filter((p) => p.badges?.includes("bestseller"));
      return sortProducts(list, "popular").slice(0, limit);
    },

    async getRelatedProducts(product, limit = 4) {
      const list = (await visible()).filter(
        (p) => p.slug !== product.slug && p.categorySlug === product.categorySlug,
      );
      // Eyni alt kateqoriya əvvəl gəlsin
      const ranked = sortProducts(list, "popular").sort(
        (a, b) =>
          Number(b.subcategorySlug === product.subcategorySlug) -
          Number(a.subcategorySlug === product.subcategorySlug),
      );
      return ranked.slice(0, limit);
    },

    async searchProducts(term, locale, limit = 8) {
      const needle = normalize(term.trim());
      if (!needle) return [];
      const hits = (await visible()).filter((p) => {
        const haystack = normalize(`${p.name[locale]} ${p.name.az} ${p.brand ?? ""}`);
        return haystack.includes(needle);
      });
      return sortProducts(hits, "popular").slice(0, limit);
    },

    async getBrands(categorySlug) {
      const brands = (await visible())
        .filter((p) => !categorySlug || p.categorySlug === categorySlug)
        .map((p) => p.brand)
        .filter((b): b is string => Boolean(b));
      return [...new Set(brands)].sort();
    },

    async getProductCounts() {
      const counts: Record<string, number> = {};
      for (const p of await visible()) {
        counts[p.categorySlug] = (counts[p.categorySlug] ?? 0) + 1;
      }
      return counts;
    },
  };
}
```

- [ ] **Step 4: Rewrite `lib/data/local.ts`** to use it. Replace everything from `const byOrder` through the end of `getProductCounts` with the spread, and drop now-unused imports (`Product`, `applyProductQuery`, `sortProducts`):

```ts
import { createCatalogMethods } from "./catalog-core";
// ...existing data imports unchanged...

export const localRepository: CatalogRepository = {
  ...createCatalogMethods(async () => ({ categories, products })),

  async getSubscriptionPlans() {
    return subscriptionPlans;
  },
  // ...all remaining content methods (getServices … getHomeContent) unchanged...
};
```

- [ ] **Step 5: Run tests, typecheck, lint, data validation**

Run: `npx vitest run && npx tsc --noEmit && npx eslint . --quiet && npm run validate:data`
Expected: all tests pass; no errors.

- [ ] **Step 6: Commit**

```bash
git add lib/data/catalog-core.ts lib/data/local.ts tests/data/catalog-core.test.ts
git commit -m "refactor: share catalog logic between data sources"
```

---

### Task 3: Database migration (schema, rules, RLS, grants, storage)

**Files:**
- Create: `supabase/migrations/20261022000000_init.sql`, `supabase/config.toml` (generated by `supabase init`)

**Interfaces:**
- Produces tables `categories`, `subcategories`, `products`, `orders`, `service_requests`, `admins`, `audit_log`; functions `public.localized_complete(jsonb)`, `public.is_admin()`; bucket `product-images`. Column names exactly as below — Task 4's row types mirror them.

- [ ] **Step 1: Initialise the Supabase folder**

Run: `npx supabase@2 init` (answer "N" to VS Code / IntelliJ prompts)
Expected: `supabase/config.toml` created.

- [ ] **Step 2: Write `supabase/migrations/20261022000000_init.sql`**

```sql
-- Complex Garden: kataloq, sifarişlər, sorğular, adminlər, tarixçə, şəkil yaddaşı (v1)

-- ---------------------------------------------------------------- tiplər
create type public.world as enum ('pool', 'garden');
create type public.product_type as enum ('chemical', 'plant', 'equipment', 'general');
create type public.product_status as enum ('draft', 'published', 'archived');
create type public.order_status as enum ('new', 'confirmed', 'delivered', 'cancelled');
create type public.request_status as enum ('new', 'contacted', 'closed');

-- ---------------------------------------------------------------- köməkçi funksiyalar
-- {az, ru, en} — üçü də boş olmayan mətndirmi
create or replace function public.localized_complete(value jsonb)
returns boolean language sql immutable as $$
  select value is not null
    and coalesce(length(trim(value ->> 'az')), 0) > 0
    and coalesce(length(trim(value ->> 'ru')), 0) > 0
    and coalesce(length(trim(value ->> 'en')), 0) > 0
$$;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------- adminlər
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid())
$$;

-- ---------------------------------------------------------------- kateqoriyalar
create table public.categories (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name jsonb not null default '{"az":"","ru":"","en":""}',
  short_name jsonb,
  description jsonb not null default '{"az":"","ru":"","en":""}',
  guide jsonb,
  faq jsonb not null default '[]',
  world public.world not null,
  image text not null default '',
  active boolean not null default false,
  sort_order int not null default 0,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null,
  constraint categories_active_complete
    check (not active or (public.localized_complete(name) and public.localized_complete(description)))
);

create table public.subcategories (
  category_slug text not null references public.categories (slug) on update cascade on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name jsonb not null,
  recurring boolean not null default false,
  active boolean not null default true,
  sort_order int not null default 0,
  primary key (category_slug, slug),
  constraint subcategories_name_complete check (public.localized_complete(name))
);

-- ---------------------------------------------------------------- məhsullar
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  status public.product_status not null default 'draft',
  name jsonb not null default '{"az":"","ru":"","en":""}',
  description jsonb not null default '{"az":"","ru":"","en":""}',
  category_slug text not null references public.categories (slug) on update cascade,
  subcategory_slug text,
  product_type public.product_type not null default 'general',
  price numeric(10, 2) not null check (price > 0),
  old_price numeric(10, 2),
  in_stock boolean not null default true,
  lead_time_days int check (lead_time_days >= 0),
  subscription_eligible boolean not null default false,
  brand text,
  badges text[] not null default '{}'
    check (badges <@ array['sale', 'new', 'subscription', 'bestseller']),
  images text[] not null default '{}',
  specs jsonb not null default '[]',
  plant_passport jsonb,
  dosage jsonb,
  installation_service jsonb,
  attributes jsonb,
  warranty_months int check (warranty_months >= 0),
  bought_together text[] not null default '{}',
  rating numeric(2, 1) check (rating between 0 and 5),
  reviews_count int check (reviews_count >= 0),
  popularity int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null,
  constraint products_old_price check (old_price is null or old_price > price),
  constraint products_subcategory_fk foreign key (category_slug, subcategory_slug)
    references public.subcategories (category_slug, slug) on update cascade,
  constraint products_published_complete check (
    status <> 'published'
    or (public.localized_complete(name) and public.localized_complete(description) and cardinality(images) > 0)
  )
);

create index products_category_idx on public.products (category_slug);
create index products_status_idx on public.products (status);

-- Dərc olunmuş məhsulun ünvanı dəyişməz (SEO və kampaniya istinadları)
create or replace function public.lock_published_slug()
returns trigger language plpgsql as $$
begin
  if old.status = 'published' and new.slug <> old.slug then
    raise exception 'Dərc olunmuş məhsulun slug-ı dəyişdirilə bilməz' using errcode = 'check_violation';
  end if;
  return new;
end $$;

create trigger products_lock_slug before update on public.products
  for each row execute function public.lock_published_slug();

-- ---------------------------------------------------------------- sifarişlər və sorğular
create table public.orders (
  id text primary key check (id ~ '^[0-9]{6}-[0-9A-Z]{4}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status public.order_status not null default 'new',
  locale text not null check (locale in ('az', 'ru', 'en')),
  customer jsonb not null,
  items jsonb not null check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) > 0),
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  delivery_fee numeric(10, 2) not null default 0 check (delivery_fee >= 0),
  total numeric(10, 2) not null check (total >= 0),
  admin_note text not null default '',
  ip_hash text
);

create index orders_created_idx on public.orders (created_at desc);
create index orders_ip_idx on public.orders (ip_hash, created_at);

create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status public.request_status not null default 'new',
  name text not null check (length(trim(name)) > 0),
  phone text not null check (length(trim(phone)) > 0),
  service text,
  message text not null default '',
  source_path text,
  admin_note text not null default '',
  ip_hash text
);

create index service_requests_created_idx on public.service_requests (created_at desc);
create index service_requests_ip_idx on public.service_requests (ip_hash, created_at);

-- ---------------------------------------------------------------- tarixçə
create table public.audit_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  user_id uuid references auth.users (id) on delete set null,
  entity text not null check (entity in ('product', 'category', 'order', 'request', 'admin')),
  entity_id text not null,
  action text not null,
  changes jsonb
);

create index audit_log_entity_idx on public.audit_log (entity, entity_id, at desc);

-- ---------------------------------------------------------------- updated_at
create trigger categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();
create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();
create trigger service_requests_updated_at before update on public.service_requests
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- hüquqlar
-- Layihədə "Automatically expose new tables" bağlıdır — hər şey açıq yazılır
grant usage on schema public to anon, authenticated, service_role;
grant select on public.categories, public.subcategories, public.products to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;
grant execute on function public.is_admin(), public.localized_complete(jsonb) to anon, authenticated, service_role;

-- ---------------------------------------------------------------- RLS
alter table public.admins enable row level security;
alter table public.categories enable row level security;
alter table public.subcategories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.service_requests enable row level security;
alter table public.audit_log enable row level security;

create policy "categories: read active" on public.categories
  for select to anon, authenticated using (active or public.is_admin());
create policy "categories: admin write" on public.categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Aktiv kateqoriyanın bütün alt kateqoriyaları oxunur (gizli alt kateqoriyanın məhsullarını gizlətmək üçün `active` lazımdır)
create policy "subcategories: read of active categories" on public.subcategories
  for select to anon, authenticated using (
    exists (select 1 from public.categories c where c.slug = category_slug and (c.active or public.is_admin()))
  );
create policy "subcategories: admin write" on public.subcategories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "products: read published" on public.products
  for select to anon, authenticated using (status = 'published' or public.is_admin());
create policy "products: admin write" on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Sifariş/sorğu yalnız server (secret key) yoxlamadan sonra yazır; adminlər oxuyur və status dəyişir
create policy "orders: admin read" on public.orders
  for select to authenticated using (public.is_admin());
create policy "orders: admin update" on public.orders
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "service_requests: admin read" on public.service_requests
  for select to authenticated using (public.is_admin());
create policy "service_requests: admin update" on public.service_requests
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "admins: admin read" on public.admins
  for select to authenticated using (public.is_admin());

create policy "audit_log: admin read" on public.audit_log
  for select to authenticated using (public.is_admin());
create policy "audit_log: admin insert own" on public.audit_log
  for insert to authenticated with check (public.is_admin() and user_id = auth.uid());

-- ---------------------------------------------------------------- şəkillər
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do nothing;

create policy "product-images: admin insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin());
create policy "product-images: admin update" on storage.objects
  for update to authenticated using (bucket_id = 'product-images' and public.is_admin());
create policy "product-images: admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images' and public.is_admin());
```

- [ ] **Step 3: Apply to the project (user runs — needs Supabase login + DB password)**

In the app's Terminal panel the user runs, one at a time:

```bash
npx supabase@2 login
```
```bash
npx supabase@2 link --project-ref <PROJECT_REF>
```
```bash
npx supabase@2 db push
```

`<PROJECT_REF>` is the subdomain of the Project URL (`https://<PROJECT_REF>.supabase.co`). `link` asks for the database password chosen at project creation.
Fallback if the CLI is not possible: open Supabase Dashboard → SQL Editor → paste the whole file → Run.

Expected: `Applying migration 20261022000000_init.sql... Finished supabase db push.`

- [ ] **Step 4: Verify in the dashboard**

Table Editor shows the 7 tables, each with "RLS enabled"; Storage shows bucket `product-images` (Public).

- [ ] **Step 5: Commit**

```bash
git add supabase/config.toml supabase/migrations/20261022000000_init.sql supabase/.gitignore
git commit -m "feat(db): initial Supabase schema with RLS and storage"
```

---

### Task 4: Row types and mappers

**Files:**
- Create: `lib/supabase/rows.ts`, `lib/supabase/mappers.ts`, `tests/supabase/mappers.test.ts`

**Interfaces:**
- Consumes: `Category`, `Product`, `Subcategory`, `FilterDefinition` from `lib/types.ts`; `img()` from Task 1.
- Produces:
  ```ts
  export function rowToCategory(row: CategoryRow, subs: SubcategoryRow[], filters: FilterDefinition[]): Category;
  export function rowToProduct(row: ProductRow): Product;
  export function categoryToRows(c: Category): { category: CategoryRow; subcategories: SubcategoryRow[] };
  export function productToRow(p: Product, status?: ProductStatus): ProductRow;
  ```
  `categoryToRows` / `productToRow` resolve image keys to absolute URLs (`img()`), so DB rows never depend on `config/images.ts` keys.

- [ ] **Step 1: Write `lib/supabase/rows.ts`**

```ts
import type {
  Dosage,
  Localized,
  PlantPassport,
  ProductBadge,
  ProductType,
  World,
} from "@/lib/types";

/** Bazadakı sətirlərin forması — supabase/migrations/20261022000000_init.sql ilə eyni */

export type ProductStatus = "draft" | "published" | "archived";

export interface CategoryRow {
  slug: string;
  name: Localized;
  short_name: Localized | null;
  description: Localized;
  guide: Localized | null;
  faq: { question: Localized; answer: Localized }[];
  world: World;
  image: string;
  active: boolean;
  sort_order: number;
}

export interface SubcategoryRow {
  category_slug: string;
  slug: string;
  name: Localized;
  recurring: boolean;
  active: boolean;
  sort_order: number;
}

export interface ProductRow {
  slug: string;
  status: ProductStatus;
  name: Localized;
  description: Localized;
  category_slug: string;
  subcategory_slug: string | null;
  product_type: ProductType;
  price: number;
  old_price: number | null;
  in_stock: boolean;
  lead_time_days: number | null;
  subscription_eligible: boolean;
  brand: string | null;
  badges: ProductBadge[];
  images: string[];
  specs: { label: Localized; value: string | Localized }[];
  plant_passport: PlantPassport | null;
  dosage: Dosage | null;
  installation_service: { available: boolean; price: number } | null;
  attributes: Record<string, string | number | boolean> | null;
  warranty_months: number | null;
  bought_together: string[];
  rating: number | null;
  reviews_count: number | null;
  popularity: number | null;
  created_at: string;
}
```

- [ ] **Step 2: Write the failing test** — `tests/supabase/mappers.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { categories } from "@/data/categories";
import { products } from "@/data/products";
import { img } from "@/config/images";
import { categoryToRows, productToRow, rowToCategory, rowToProduct } from "@/lib/supabase/mappers";

describe("product mapping", () => {
  it("round-trips every demo product (images become absolute URLs)", () => {
    for (const p of products) {
      const back = rowToProduct(productToRow(p));
      expect(back).toEqual({ ...p, images: p.images.map((i) => img(i)) });
    }
  });

  it("defaults to published status", () => {
    expect(productToRow(products[0]).status).toBe("published");
    expect(productToRow(products[0], "draft").status).toBe("draft");
  });

  it("stores missing optionals as null / empty arrays", () => {
    const { oldPrice: _o, brand: _b, boughtTogether: _bt, ...rest } = products[0];
    const row = productToRow({ ...rest });
    expect(row.old_price).toBeNull();
    expect(row.brand).toBeNull();
    expect(row.bought_together).toEqual([]);
  });

  it("coerces numeric strings from Postgres into numbers", () => {
    const row = { ...productToRow(products[0]), price: "89.00" as unknown as number };
    expect(rowToProduct(row).price).toBe(89);
  });
});

describe("category mapping", () => {
  it("round-trips every demo category (filters come from code)", () => {
    for (const c of categories) {
      const { category, subcategories } = categoryToRows(c);
      expect(rowToCategory(category, subcategories, c.filters)).toEqual({ ...c, image: img(c.image) });
    }
  });

  it("orders subcategories by sort_order and only takes its own", () => {
    const c = categories.find((x) => x.subcategories.length > 1)!;
    const { category, subcategories } = categoryToRows(c);
    const foreign = { ...subcategories[0], category_slug: "basqa" };
    const shuffled = [foreign, ...[...subcategories].reverse()];
    expect(rowToCategory(category, shuffled, []).subcategories.map((s) => s.slug)).toEqual(
      c.subcategories.map((s) => s.slug),
    );
  });
});
```

- [ ] **Step 3: Run to see it fail**

Run: `npx vitest run tests/supabase/mappers.test.ts`
Expected: FAIL — `Cannot find module '@/lib/supabase/mappers'`.

- [ ] **Step 4: Implement `lib/supabase/mappers.ts`**

```ts
import { img } from "@/config/images";
import type { Category, FilterDefinition, Product, Subcategory } from "@/lib/types";
import type { CategoryRow, ProductRow, ProductStatus, SubcategoryRow } from "./rows";

/** Postgres `numeric` bəzən string kimi gəlir */
const num = (v: number | string): number => (typeof v === "number" ? v : Number(v));
const optNum = (v: number | string | null): number | undefined => (v === null ? undefined : num(v));
const opt = <T>(v: T | null): T | undefined => (v === null ? undefined : v);

export function rowToCategory(row: CategoryRow, subs: SubcategoryRow[], filters: FilterDefinition[]): Category {
  const subcategories: Subcategory[] = subs
    .filter((s) => s.category_slug === row.slug)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((s) => ({
      slug: s.slug,
      name: s.name,
      ...(s.recurring && { recurring: true }),
      ...(!s.active && { active: false }),
    }));

  return {
    slug: row.slug,
    name: row.name,
    ...(row.short_name && { shortName: row.short_name }),
    description: row.description,
    world: row.world,
    active: row.active,
    image: row.image,
    subcategories,
    filters,
    order: row.sort_order,
    ...(row.guide && { guide: row.guide }),
    ...(row.faq.length > 0 && { faq: row.faq }),
  };
}

export function categoryToRows(c: Category): { category: CategoryRow; subcategories: SubcategoryRow[] } {
  return {
    category: {
      slug: c.slug,
      name: c.name,
      short_name: c.shortName ?? null,
      description: c.description,
      guide: c.guide ?? null,
      faq: c.faq ?? [],
      world: c.world,
      image: img(c.image),
      active: c.active,
      sort_order: c.order,
    },
    subcategories: c.subcategories.map((s, index) => ({
      category_slug: c.slug,
      slug: s.slug,
      name: s.name,
      recurring: s.recurring ?? false,
      active: s.active ?? true,
      sort_order: index,
    })),
  };
}

export function rowToProduct(row: ProductRow): Product {
  const product: Product = {
    slug: row.slug,
    name: row.name,
    categorySlug: row.category_slug,
    subcategorySlug: opt(row.subcategory_slug),
    productType: row.product_type,
    price: num(row.price),
    oldPrice: optNum(row.old_price),
    images: row.images,
    badges: row.badges.length > 0 ? row.badges : undefined,
    inStock: row.in_stock,
    leadTimeDays: opt(row.lead_time_days),
    subscriptionEligible: row.subscription_eligible,
    brand: opt(row.brand),
    description: row.description,
    specs: row.specs,
    plantPassport: opt(row.plant_passport),
    dosage: opt(row.dosage),
    installationService: opt(row.installation_service),
    warrantyMonths: opt(row.warranty_months),
    attributes: opt(row.attributes),
    boughtTogether: row.bought_together.length > 0 ? row.bought_together : undefined,
    rating: optNum(row.rating),
    reviewsCount: opt(row.reviews_count),
    popularity: opt(row.popularity),
    createdAt: row.created_at.slice(0, 10),
  };
  // Boş sahələri çıxar ki, obyekt fayldakı ilə eyni formada olsun
  return Object.fromEntries(Object.entries(product).filter(([, v]) => v !== undefined)) as Product;
}

export function productToRow(p: Product, status: ProductStatus = "published"): ProductRow {
  return {
    slug: p.slug,
    status,
    name: p.name,
    description: p.description,
    category_slug: p.categorySlug,
    subcategory_slug: p.subcategorySlug ?? null,
    product_type: p.productType,
    price: p.price,
    old_price: p.oldPrice ?? null,
    in_stock: p.inStock,
    lead_time_days: p.leadTimeDays ?? null,
    subscription_eligible: p.subscriptionEligible,
    brand: p.brand ?? null,
    badges: p.badges ?? [],
    images: p.images.map((i) => img(i)),
    specs: p.specs,
    plant_passport: p.plantPassport ?? null,
    dosage: p.dosage ?? null,
    installation_service: p.installationService ?? null,
    attributes: p.attributes ?? null,
    warranty_months: p.warrantyMonths ?? null,
    bought_together: p.boughtTogether ?? [],
    rating: p.rating ?? null,
    reviews_count: p.reviewsCount ?? null,
    popularity: p.popularity ?? null,
    created_at: p.createdAt,
  };
}
```

Note: `createdAt` is a date (`YYYY-MM-DD`) in the app; the DB returns `timestamptz` (`2026-03-01T00:00:00+00:00`), hence `.slice(0, 10)`.

- [ ] **Step 5: Run tests**

Run: `npx vitest run tests/supabase/mappers.test.ts`
Expected: PASS. If a round-trip fails, the diff names the field — fix the mapper, not the test.

- [ ] **Step 6: Typecheck, lint, commit**

```bash
npx tsc --noEmit && npx eslint . --quiet
git add lib/supabase/rows.ts lib/supabase/mappers.ts tests/supabase/mappers.test.ts
git commit -m "feat(db): row types and mappers for categories and products"
```

---

### Task 5: Supabase clients, env, seed script

**Files:**
- Create: `lib/supabase/env.ts`, `lib/supabase/public.ts`, `lib/supabase/service.ts`, `scripts/seed-supabase.ts`, `tests/supabase/env.test.ts`
- Modify: `.env.example`, `package.json` (deps + `"seed": "tsx --env-file=.env.local scripts/seed-supabase.ts"`)

**Interfaces:**
- Produces:
  ```ts
  // env.ts
  export function supabasePublicEnv(): { url: string; key: string } | null;
  export function supabaseSecretKey(): string; // throws if missing
  // public.ts
  export function createPublicClient(): SupabaseClient;
  // service.ts ("server-only")
  export function createServiceClient(): SupabaseClient;
  ```

- [ ] **Step 1: Install**

Run: `npm i @supabase/supabase-js@2 server-only`

- [ ] **Step 2: Failing test** — `tests/supabase/env.test.ts`

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { supabasePublicEnv, supabaseSecretKey } from "@/lib/supabase/env";

describe("supabase env", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("is null when the public vars are missing", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    expect(supabasePublicEnv()).toBeNull();
  });

  it("returns url and key when both are set", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abc.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_x");
    expect(supabasePublicEnv()).toEqual({ url: "https://abc.supabase.co", key: "sb_publishable_x" });
  });

  it("throws a clear error when the secret key is missing", () => {
    vi.stubEnv("SUPABASE_SECRET_KEY", "");
    expect(() => supabaseSecretKey()).toThrow(/SUPABASE_SECRET_KEY/);
  });
});
```

Run: `npx vitest run tests/supabase/env.test.ts` → FAIL (module missing).

- [ ] **Step 3: Implement clients**

`lib/supabase/env.ts`:
```ts
/** Supabase açarları. Public olanlar yoxdursa sayt `/data` fayllarından işləyir. */
export function supabasePublicEnv(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return url && key ? { url, key } : null;
}

export function supabaseSecretKey(): string {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) throw new Error("SUPABASE_SECRET_KEY təyin olunmayıb (.env.local)");
  return key;
}
```

`lib/supabase/public.ts`:
```ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabasePublicEnv } from "./env";

/** Cookie-siz anonim klient — "use cache" daxilində ictimai oxumalar üçün */
export function createPublicClient(): SupabaseClient {
  const env = supabasePublicEnv();
  if (!env) throw new Error("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY təyin olunmayıb");
  return createClient(env.url, env.key, { auth: { persistSession: false, autoRefreshToken: false } });
}
```

`lib/supabase/service.ts`:
```ts
import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabasePublicEnv, supabaseSecretKey } from "./env";

/** RLS-i keçən klient — yalnız serverdə, yoxlamadan sonra (sifariş yazmaq, admin dəvəti) */
export function createServiceClient(): SupabaseClient {
  const env = supabasePublicEnv();
  if (!env) throw new Error("NEXT_PUBLIC_SUPABASE_URL təyin olunmayıb");
  return createClient(env.url, supabaseSecretKey(), { auth: { persistSession: false, autoRefreshToken: false } });
}
```

Run: `npx vitest run tests/supabase/env.test.ts` → PASS.

- [ ] **Step 4: Document env** — append to `.env.example`:

```
# Supabase (Project Settings → API Keys). Bunlar yoxdursa sayt /data fayllarından işləyir.
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
# Gizli açar — yalnız .env.local, heç vaxt commit etməyin
SUPABASE_SECRET_KEY=sb_secret_...
```

- [ ] **Step 5: Write `scripts/seed-supabase.ts`** (the script cannot import `server-only`, so it builds its own client)

```ts
/**
 * /data kateqoriya və məhsullarını Supabase-ə köçürür (slug üzrə upsert — təkrar işlətmək təhlükəsizdir).
 * İşlətmək: `npm run seed`
 */
import { createClient } from "@supabase/supabase-js";
import { categories } from "../data/categories";
import { products } from "../data/products";
import { supabasePublicEnv, supabaseSecretKey } from "../lib/supabase/env";
import { categoryToRows, productToRow } from "../lib/supabase/mappers";

async function main() {
  const env = supabasePublicEnv();
  if (!env) throw new Error("NEXT_PUBLIC_SUPABASE_URL / _PUBLISHABLE_KEY yoxdur");
  const db = createClient(env.url, supabaseSecretKey(), { auth: { persistSession: false } });

  const rows = categories.map(categoryToRows);
  const cat = await db.from("categories").upsert(rows.map((r) => r.category), { onConflict: "slug" });
  if (cat.error) throw cat.error;

  const sub = await db
    .from("subcategories")
    .upsert(rows.flatMap((r) => r.subcategories), { onConflict: "category_slug,slug" });
  if (sub.error) throw sub.error;

  const prod = await db.from("products").upsert(products.map((p) => productToRow(p)), { onConflict: "slug" });
  if (prod.error) throw prod.error;

  const { count } = await db.from("products").select("*", { count: "exact", head: true });
  console.log(`Kateqoriya: ${rows.length}, məhsul: ${products.length} (bazada ${count})`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

Add to `package.json` scripts: `"seed": "tsx --env-file=.env.local scripts/seed-supabase.ts"`.

- [ ] **Step 6: Run the seed** (requires `.env.local` with all three vars — the user adds `SUPABASE_SECRET_KEY` themselves)

Run: `npm run seed`
Expected: `Kateqoriya: <N>, məhsul: <M> (bazada <M>)`. Run it a second time — same output, no duplicate-key error.

- [ ] **Step 7: Typecheck, lint, commit**

```bash
npx tsc --noEmit && npx eslint . --quiet && npx vitest run
git add lib/supabase/env.ts lib/supabase/public.ts lib/supabase/service.ts scripts/seed-supabase.ts tests/supabase/env.test.ts .env.example package.json package-lock.json
git commit -m "feat(db): Supabase clients and catalog seed script"
```

---

### Task 6: Security check script (RLS)

**Files:**
- Create: `scripts/check-rls.ts`
- Modify: `package.json` (`"check:rls": "tsx --env-file=.env.local scripts/check-rls.ts"`)

**Interfaces:**
- Consumes: env helpers (Task 5), seeded data (Task 5).

- [ ] **Step 1: Write `scripts/check-rls.ts`**

```ts
/**
 * Təhlükəsizlik yoxlaması: anonim istifadəçi yalnız dərc olunmuşu oxuyur, heç yerə yaza bilmir.
 * İşlətmək: `npm run check:rls` (exit code 1 = problem)
 */
import { createClient } from "@supabase/supabase-js";
import { products } from "../data/products";
import { supabasePublicEnv, supabaseSecretKey } from "../lib/supabase/env";
import { productToRow } from "../lib/supabase/mappers";

const env = supabasePublicEnv();
if (!env) throw new Error("Supabase env yoxdur");
const anon = createClient(env.url, env.key, { auth: { persistSession: false } });
const service = createClient(env.url, supabaseSecretKey(), { auth: { persistSession: false } });

const failures: string[] = [];
const expect = (ok: boolean, message: string) => {
  console.log(`${ok ? "✓" : "✗"} ${message}`);
  if (!ok) failures.push(message);
};

async function main() {
  const draftSlug = "rls-yoxlama-qaralama";
  await service.from("products").upsert({ ...productToRow(products[0], "draft"), slug: draftSlug }, { onConflict: "slug" });

  try {
    const published = await anon.from("products").select("slug, status");
    expect(!published.error && (published.data?.length ?? 0) > 0, "anon dərc olunmuş məhsulları oxuyur");
    expect(published.data?.every((p) => p.status === "published") ?? false, "anon qaralamaları görmür");

    const insertProduct = await anon.from("products").insert({ ...productToRow(products[0]), slug: "rls-hack" });
    expect(insertProduct.error !== null, "anon məhsul əlavə edə bilmir");

    const update = await anon.from("products").update({ price: 1 }).eq("slug", products[0].slug).select();
    expect((update.data?.length ?? 0) === 0, "anon qiyməti dəyişə bilmir");

    const order = await anon.from("orders").insert({
      id: "261022-TEST", locale: "az", customer: {}, items: [{}], subtotal: 1, total: 1,
    });
    expect(order.error !== null, "anon sifarişi birbaşa yaza bilmir");

    const readOrders = await anon.from("orders").select("id");
    expect((readOrders.data?.length ?? 0) === 0, "anon sifarişləri oxuya bilmir");

    const admins = await anon.from("admins").select("user_id");
    expect((admins.data?.length ?? 0) === 0, "anon adminləri görmür");

    const upload = await anon.storage.from("product-images").upload("rls-test.txt", new Blob(["x"]), {
      contentType: "image/png",
    });
    expect(upload.error !== null, "anon şəkil yükləyə bilmir");
  } finally {
    await service.from("products").delete().eq("slug", draftSlug);
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length} yoxlama uğursuz oldu`);
    process.exit(1);
  }
  console.log("\nBütün təhlükəsizlik yoxlamaları keçdi");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

- [ ] **Step 2: Run it**

Run: `npm run check:rls`
Expected: 8 lines with `✓`, then `Bütün təhlükəsizlik yoxlamaları keçdi`. Any `✗` → fix the migration with a new migration file (`supabase/migrations/<timestamp>_fix_rls.sql`, `npx supabase@2 db push`), never by editing the applied one.

- [ ] **Step 3: Commit**

```bash
git add scripts/check-rls.ts package.json
git commit -m "test(db): RLS check script"
```

---

### Task 7: Supabase repository + switch the site

**Files:**
- Create: `lib/data/supabase.ts`, `tests/data/repository-choice.test.ts`
- Modify: `lib/data/index.ts`, `next.config.ts`

**Interfaces:**
- Consumes: `createCatalogMethods` (Task 2), `rowToCategory` / `rowToProduct` (Task 4), `createPublicClient` (Task 5), `localRepository`.
- Produces: `export const CATALOG_TAG = "catalog"` (from `lib/data/supabase.ts` — plans 3 and 4 call `updateTag(CATALOG_TAG)` after writes); `export const supabaseRepository: CatalogRepository`; `export function chooseRepository(): CatalogRepository` (from `lib/data/index.ts`).

- [ ] **Step 1: Failing test** — `tests/data/repository-choice.test.ts`

```ts
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ cacheLife: () => {}, cacheTag: () => {} }));

describe("chooseRepository", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("uses local files without Supabase env", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    const { chooseRepository } = await import("@/lib/data");
    const { localRepository } = await import("@/lib/data/local");
    expect(chooseRepository()).toBe(localRepository);
  });

  it("uses Supabase when env is present", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abc.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_x");
    const { chooseRepository } = await import("@/lib/data");
    const { supabaseRepository } = await import("@/lib/data/supabase");
    expect(chooseRepository()).toBe(supabaseRepository);
  });
});
```

Run: `npx vitest run tests/data/repository-choice.test.ts` → FAIL (`chooseRepository` not exported).

- [ ] **Step 2: Implement `lib/data/supabase.ts`**

```ts
import { cacheLife, cacheTag } from "next/cache";
import { categories as codeCategories } from "@/data/categories";
import { createPublicClient } from "@/lib/supabase/public";
import { rowToCategory, rowToProduct } from "@/lib/supabase/mappers";
import type { CategoryRow, ProductRow, SubcategoryRow } from "@/lib/supabase/rows";
import { createCatalogMethods, type CatalogSnapshot } from "./catalog-core";
import { localRepository } from "./local";
import type { CatalogRepository } from "./repository";

/** Admin yazısından sonra `updateTag(CATALOG_TAG)` — kataloq dərhal yenilənir */
export const CATALOG_TAG = "catalog";

// Kateqoriya filtrləri v1-də kodda qalır
const codeFilters = new Map(codeCategories.map((c) => [c.slug, c.filters]));

async function loadCatalog(): Promise<CatalogSnapshot> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("days");

  const db = createPublicClient();
  const [cats, subs, prods] = await Promise.all([
    db.from("categories").select("*").order("sort_order"),
    db.from("subcategories").select("*").order("sort_order"),
    db.from("products").select("*").eq("status", "published"),
  ]);
  for (const result of [cats, subs, prods]) {
    if (result.error) throw new Error(`Supabase kataloq oxuması: ${result.error.message}`);
  }

  const subRows = subs.data as SubcategoryRow[];
  return {
    categories: (cats.data as CategoryRow[]).map((row) =>
      rowToCategory(row, subRows, codeFilters.get(row.slug) ?? []),
    ),
    products: (prods.data as ProductRow[]).map(rowToProduct),
  };
}

/** Kateqoriya və məhsullar Supabase-dən; qalan məzmun (kampaniya, xidmət, səhifələr) hələlik koddan */
export const supabaseRepository: CatalogRepository = {
  ...localRepository,
  ...createCatalogMethods(loadCatalog),
};
```

- [ ] **Step 3: Update `lib/data/index.ts`**

```ts
import { supabasePublicEnv } from "@/lib/supabase/env";
import { localRepository } from "./local";
import type { CatalogRepository } from "./repository";
import { supabaseRepository } from "./supabase";

/**
 * Aktiv məlumat mənbəyi: Supabase açarları varsa baza, yoxdursa `/data` faylları.
 * Komponentlər birbaşa `/data`-dan deyil, həmişə `catalog` vasitəsilə oxuyur.
 */
export function chooseRepository(): CatalogRepository {
  return supabasePublicEnv() ? supabaseRepository : localRepository;
}

export const catalog: CatalogRepository = chooseRepository();

export type { CatalogRepository } from "./repository";
export * from "./query";
export * from "./url-query";
```

- [ ] **Step 4: Allow Storage images in `next.config.ts`** — replace the `images` block:

```ts
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

// ...inside nextConfig:
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      ...(supabaseHost
        ? [{ protocol: "https" as const, hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
        : []),
    ],
  },
```

- [ ] **Step 5: Run unit tests, typecheck, lint**

Run: `npx vitest run && npx tsc --noEmit && npx eslint . --quiet`
Expected: all pass.

- [ ] **Step 6: Verify the running site reads from Supabase**

Restart the dev server (env changes need a restart): `preview_stop` the running server, `rm -rf .next`, `preview_start` name `dev`.
Then:
1. In Supabase Table Editor change the AZ name of one product (e.g. `xlor-tabletleri-200q-5kq` → append ` TEST`). The product page will not change yet (cached for `days`) — this proves caching. Restart dev server → name shows ` TEST`. Revert the name in the dashboard.
2. Run the page sweep: `node "<scratchpad>/sweep.mjs"` (28 pages × 3 locales × 4 widths) → expected "no problems", same as before the switch.
3. Run axe: `node "<scratchpad>/axe.mjs"` → "No violations".
4. `curl -s localhost:3000/sitemap.xml | grep -c "<url>"` → same count as before (174).
5. Temporarily blank `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`, restart → site still works from `/data`; restore the value.

- [ ] **Step 7: Commit**

```bash
git add lib/data/supabase.ts lib/data/index.ts next.config.ts tests/data/repository-choice.test.ts
git commit -m "feat: site reads categories and products from Supabase (cached, tag 'catalog')"
```

---

## Out of scope for plan 1 (next plans)

- Plan 2: `@supabase/ssr` session cookies, `/admin` root layout, login, admin shell, admins page, `noindex` + `robots.txt` `Disallow: /admin`.
- Plan 3: product and category forms (zod), image upload, publish rules, `updateTag(CATALOG_TAG)`, audit log, archive.
- Plan 4: checkout Server Action (server-side pricing via `lib/cart/pricing.ts`), confirmation page, WhatsApp fallback, service requests, Telegram via `after()`, spam limits, order/request admin pages, final QA.
