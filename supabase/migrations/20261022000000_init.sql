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
