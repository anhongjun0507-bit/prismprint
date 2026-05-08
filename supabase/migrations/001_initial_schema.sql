-- DEPRECATED: see 002_revised_schema.sql
-- ========================================================================
-- PrismPrint 사내 주문몰 — 초기 스키마
-- ========================================================================
-- 11개 테이블 + RLS 정책
-- 작성일: 2026-05-08
-- ========================================================================

-- ─────────────────────────────────────────────────────────────────
-- Extensions
-- ─────────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────
-- 1. users (회원)
-- ─────────────────────────────────────────────────────────────────
-- Supabase Auth 의 auth.users 와 1:1 매칭되는 프로필 테이블
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index users_role_idx on public.users(role);

-- ─────────────────────────────────────────────────────────────────
-- 2. categories (카테고리: 명함·팜플릿·카탈로그)
-- ─────────────────────────────────────────────────────────────────
create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  description text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index categories_slug_idx on public.categories(slug);
create index categories_display_order_idx on public.categories(display_order);

-- ─────────────────────────────────────────────────────────────────
-- 3. products (상품)
-- ─────────────────────────────────────────────────────────────────
create table public.products (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid not null references public.categories(id) on delete restrict,
  name text not null,
  description text,
  base_price int not null check (base_price >= 0),
  thumbnail_url text,
  is_active boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_id_idx on public.products(category_id);
create index products_is_active_idx on public.products(is_active);
create index products_display_order_idx on public.products(display_order);

-- ─────────────────────────────────────────────────────────────────
-- 4. product_images (상품 이미지)
-- ─────────────────────────────────────────────────────────────────
create table public.product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  display_order int not null default 0
);

create index product_images_product_id_idx on public.product_images(product_id);

-- ─────────────────────────────────────────────────────────────────
-- 5. product_options (상품 옵션)
-- ─────────────────────────────────────────────────────────────────
create table public.product_options (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  option_group text not null,             -- '수량', '디자인', '재질' 등
  option_value text not null,              -- '200매', 'A타입' 등
  price_delta int not null default 0,      -- 옵션 추가 금액 (음수도 가능)
  display_order int not null default 0,
  is_default boolean not null default false
);

create index product_options_product_id_idx on public.product_options(product_id);

-- ─────────────────────────────────────────────────────────────────
-- 6. carts (장바구니)
-- ─────────────────────────────────────────────────────────────────
create table public.carts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity int not null default 1 check (quantity > 0),
  options jsonb,            -- 선택된 옵션 정보 [{group, value, price_delta}]
  custom_data jsonb,         -- 명함 입력 정보 (성명·직책·부서 등)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index carts_user_id_idx on public.carts(user_id);

-- ─────────────────────────────────────────────────────────────────
-- 7. orders (주문)
-- ─────────────────────────────────────────────────────────────────
create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text unique not null,       -- ORD-20260508-0001
  user_id uuid not null references public.users(id) on delete restrict,
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'paid', 'preparing', 'shipping', 'delivered', 'cancelled')),
  total_amount int not null check (total_amount >= 0),
  shipping_fee int not null default 3000,
  recipient_name text not null,
  recipient_phone text not null,
  shipping_address text not null,
  shipping_address_detail text,
  shipping_zipcode text,
  shipping_memo text,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz
);

create index orders_user_id_idx on public.orders(user_id);
create index orders_status_idx on public.orders(status);
create index orders_created_at_idx on public.orders(created_at desc);
create index orders_order_number_idx on public.orders(order_number);

-- ─────────────────────────────────────────────────────────────────
-- 8. order_items (주문 상품 — 결제 시점 스냅샷)
-- ─────────────────────────────────────────────────────────────────
create table public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,             -- 결제 시점 스냅샷
  unit_price int not null check (unit_price >= 0),
  quantity int not null check (quantity > 0),
  options jsonb,
  custom_data jsonb,
  subtotal int not null check (subtotal >= 0)
);

create index order_items_order_id_idx on public.order_items(order_id);

-- ─────────────────────────────────────────────────────────────────
-- 9. deposits (무통장 입금 정보)
-- ─────────────────────────────────────────────────────────────────
create table public.deposits (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid unique not null references public.orders(id) on delete cascade,
  depositor_name text not null,            -- 입금자명 (사용자 입력)
  expected_amount int not null check (expected_amount >= 0),
  bank_name text,
  account_number text,
  confirmed boolean not null default false,
  confirmed_at timestamptz,
  confirmed_by uuid references public.users(id) on delete set null,
  memo text,
  created_at timestamptz not null default now()
);

create index deposits_confirmed_idx on public.deposits(confirmed);
create index deposits_order_id_idx on public.deposits(order_id);

-- ─────────────────────────────────────────────────────────────────
-- 10. site_settings (사이트 설정 — 싱글톤)
-- ─────────────────────────────────────────────────────────────────
create table public.site_settings (
  id int primary key default 1 check (id = 1),
  site_name text not null default '사내 주문몰',
  company_name text,
  customer_service_phone text,
  customer_service_email text,
  bank_account jsonb,                       -- {bank, number, holder}
  shipping_fee int not null default 3000,
  free_shipping_threshold int,              -- 무료배송 기준액 (null이면 항상 부과)
  updated_at timestamptz not null default now()
);

-- 기본 레코드 한 개 삽입
insert into public.site_settings (id) values (1);

-- ─────────────────────────────────────────────────────────────────
-- 11. notices (공지사항)
-- ─────────────────────────────────────────────────────────────────
create table public.notices (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  content text,
  is_pinned boolean not null default false,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index notices_is_pinned_idx on public.notices(is_pinned);
create index notices_created_at_idx on public.notices(created_at desc);

-- ========================================================================
-- 함수 — 주문번호 자동 생성
-- ========================================================================
create or replace function public.generate_order_number()
returns text as $$
declare
  today_str text;
  sequence_num int;
  new_order_number text;
begin
  today_str := to_char(now() at time zone 'Asia/Seoul', 'YYYYMMDD');

  select coalesce(max(substring(order_number from 14)::int), 0) + 1
  into sequence_num
  from public.orders
  where order_number like 'ORD-' || today_str || '-%';

  new_order_number := 'ORD-' || today_str || '-' || lpad(sequence_num::text, 4, '0');
  return new_order_number;
end;
$$ language plpgsql security definer;

-- ========================================================================
-- 트리거 — updated_at 자동 갱신
-- ========================================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at before update on public.users
  for each row execute function public.set_updated_at();
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();
create trigger carts_updated_at before update on public.carts
  for each row execute function public.set_updated_at();
create trigger site_settings_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();
create trigger notices_updated_at before update on public.notices
  for each row execute function public.set_updated_at();

-- ========================================================================
-- 트리거 — auth.users 생성 시 public.users 자동 생성
-- ========================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ========================================================================
-- Row Level Security (RLS) 정책
-- ========================================================================

-- users
alter table public.users enable row level security;

create policy "본인 정보 조회"
  on public.users for select
  using (auth.uid() = id);

create policy "본인 정보 수정"
  on public.users for update
  using (auth.uid() = id);

create policy "관리자는 모든 회원 조회"
  on public.users for select
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

-- categories (누구나 읽기, admin만 수정)
alter table public.categories enable row level security;

create policy "카테고리 누구나 조회"
  on public.categories for select
  using (is_active = true);

create policy "관리자만 카테고리 수정"
  on public.categories for all
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

-- products
alter table public.products enable row level security;

create policy "활성 상품 누구나 조회"
  on public.products for select
  using (is_active = true);

create policy "관리자는 모든 상품 조회"
  on public.products for select
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

create policy "관리자만 상품 수정"
  on public.products for insert
  with check (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

create policy "관리자만 상품 변경"
  on public.products for update
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

create policy "관리자만 상품 삭제"
  on public.products for delete
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

-- product_images, product_options (products와 동일 정책)
alter table public.product_images enable row level security;
create policy "이미지 누구나 조회" on public.product_images for select using (true);
create policy "이미지 관리자만 수정" on public.product_images for all
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));

alter table public.product_options enable row level security;
create policy "옵션 누구나 조회" on public.product_options for select using (true);
create policy "옵션 관리자만 수정" on public.product_options for all
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));

-- carts (본인 것만)
alter table public.carts enable row level security;

create policy "본인 장바구니만 접근"
  on public.carts for all
  using (auth.uid() = user_id);

-- orders
alter table public.orders enable row level security;

create policy "본인 주문만 조회"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "본인 주문 생성"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "관리자는 모든 주문 조회"
  on public.orders for select
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

create policy "관리자만 주문 상태 변경"
  on public.orders for update
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

-- order_items
alter table public.order_items enable row level security;

create policy "본인 주문 상품 조회"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

create policy "주문 시 상품 추가"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

create policy "관리자는 모든 주문상품 조회"
  on public.order_items for select
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

-- deposits
alter table public.deposits enable row level security;

create policy "본인 입금정보 조회"
  on public.deposits for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = deposits.order_id and o.user_id = auth.uid()
    )
  );

create policy "주문 시 입금정보 생성"
  on public.deposits for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = deposits.order_id and o.user_id = auth.uid()
    )
  );

create policy "관리자만 입금 확인"
  on public.deposits for update
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

create policy "관리자는 모든 입금 조회"
  on public.deposits for select
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

-- site_settings
alter table public.site_settings enable row level security;

create policy "사이트 설정 누구나 조회"
  on public.site_settings for select using (true);

create policy "사이트 설정 관리자만 수정"
  on public.site_settings for update
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

-- notices
alter table public.notices enable row level security;

create policy "공지 누구나 조회"
  on public.notices for select
  using (is_published = true);

create policy "관리자만 공지 수정"
  on public.notices for all
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

-- ========================================================================
-- 끝
-- ========================================================================
