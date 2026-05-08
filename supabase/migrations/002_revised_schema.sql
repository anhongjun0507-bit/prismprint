-- ========================================================================
-- PrismPrint — 002 개정 스키마 (Phase 1 작업 범위 반영)
-- ========================================================================
-- 변경 사항 요약:
--   - 회원가입 없음(비회원 사이트), 관리자 1명만 auth.users 로 운영
--   - users / carts / product_options / product_images / notices / faqs /
--     site_settings 제거
--   - categories 복원(8행 INSERT 포함, 코드 상수 대신 DB 기준)
--   - products.options / products.images 는 jsonb 통합
--   - orders 에 phone_last4, depositor_name, tracking_number 추가
--   - order_items 에 product_slug, category_id, thumbnail_url,
--     selected_options(jsonb), custom_data(jsonb) 스냅샷 필드
--   - 게시판 2종: qna_posts(+qna_replies), reviews — 비회원 글쓰기
--   - RLS: anon SELECT/INSERT 폭넓게 허용, UPDATE/DELETE 는 authenticated 만
--
-- 적용 시점: DB 가 비어 있는 상태에서 실행한다. 001 의 테이블이 남아 있어도
-- 안전하게 재적용 되도록 DROP IF EXISTS 를 먼저 수행한다.
-- ========================================================================

-- ─────────────────────────────────────────────────────────────────
-- Extensions
-- ─────────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────
-- 0. 기존 001 테이블 정리 (DB 가 비어 있는 전제, 안전하게 IF EXISTS)
-- ─────────────────────────────────────────────────────────────────
-- 트리거·함수도 같이 정리한다. 종속성 순서대로 cascade.

drop trigger if exists on_auth_user_created on auth.users;

drop table if exists public.qna_replies        cascade;
drop table if exists public.qna_posts          cascade;
drop table if exists public.reviews            cascade;
drop table if exists public.product_reviews    cascade;
drop table if exists public.deposits           cascade;
drop table if exists public.order_items        cascade;
drop table if exists public.orders             cascade;
drop table if exists public.carts              cascade;
drop table if exists public.product_options    cascade;
drop table if exists public.product_images     cascade;
drop table if exists public.products           cascade;
drop table if exists public.categories         cascade;
drop table if exists public.notices            cascade;
drop table if exists public.faqs               cascade;
drop table if exists public.site_settings      cascade;
drop table if exists public.users              cascade;

drop function if exists public.generate_order_number() cascade;
drop function if exists public.set_updated_at()        cascade;
drop function if exists public.handle_new_user()       cascade;
drop function if exists public.is_admin()              cascade;

-- ========================================================================
-- 공용 함수
-- ========================================================================

-- updated_at 자동 갱신
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

-- 관리자 판별 헬퍼.
-- 회원이 없는 사이트라 단순히 "로그인 한 사람 = admin" 으로 본다.
-- (Supabase Auth 에 admin 1명만 등록한다는 전제)
create or replace function public.is_admin()
returns boolean as $$
  select auth.uid() is not null;
$$ language sql stable;

-- ─────────────────────────────────────────────────────────────────
-- 1. categories (8개 고정)
-- ─────────────────────────────────────────────────────────────────
create table public.categories (
  id            uuid primary key default uuid_generate_v4(),
  slug          text unique not null,
  name          text not null,
  description   text,
  display_order int  not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index categories_slug_idx          on public.categories(slug);
create index categories_display_order_idx on public.categories(display_order);

create trigger categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- 8개 카테고리 시드
insert into public.categories (slug, name, description, display_order) values
  ('business-card', '명함 제작',   '일반·고급·양면 명함 인쇄',     1),
  ('sticker',       '스티커 제작', '원형·사각·도무송 스티커',       2),
  ('coupon',        '쿠폰 제작',   '할인·이벤트용 쿠폰',            3),
  ('flyer',         '전단지 제작', 'A4·A5·B5 전단지',               4),
  ('poster',        '포스터',      'A2·A1 대형 포스터',             5),
  ('mini-banner',   '미니배너',    '탁상용 미니 X·거치형 배너',     6),
  ('banner',        '배너',        '실외 현수막·X·롤배너',          7),
  ('sash',          '어깨띠',      '행사·광고용 어깨띠',            8);

-- ─────────────────────────────────────────────────────────────────
-- 2. products  (옵션·이미지는 jsonb 통합)
-- ─────────────────────────────────────────────────────────────────
-- options jsonb 형태:
--   [{ "name": "수량", "values": [{ "label": "200매", "price_delta": 0 }, ...],
--      "display_order": 1, "is_required": true }, ...]
-- images jsonb 형태:
--   [{ "url": "...", "alt": "...", "display_order": 1 }, ...]
create table public.products (
  id            uuid primary key default uuid_generate_v4(),
  category_id   uuid not null references public.categories(id) on delete restrict,
  slug          text unique not null,
  name          text not null,
  description   text,
  base_price    int  not null check (base_price >= 0),
  thumbnail_url text,
  images        jsonb not null default '[]'::jsonb,
  options       jsonb not null default '[]'::jsonb,
  is_active     boolean not null default true,
  display_order int  not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index products_category_id_idx    on public.products(category_id);
create index products_slug_idx           on public.products(slug);
create index products_is_active_idx      on public.products(is_active);
create index products_display_order_idx  on public.products(display_order);

create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────
-- 3. orders (비회원 주문, 무통장입금)
-- ─────────────────────────────────────────────────────────────────
create table public.orders (
  id                       uuid primary key default uuid_generate_v4(),
  order_number             text unique not null,           -- ORD-YYYYMMDD-NNNN
  status                   text not null default 'pending_payment'
    check (status in ('pending_payment', 'paid', 'preparing', 'shipping', 'delivered', 'cancelled')),

  -- 금액 (모두 정수, 원 단위)
  total_amount             int  not null check (total_amount >= 0),
  shipping_fee             int  not null default 3000 check (shipping_fee >= 0),

  -- 받는 사람 / 배송지
  recipient_name           text not null,
  recipient_phone          text not null,
  phone_last4              text not null,                  -- 비회원 주문 조회용 (전화 끝 4자리)
  shipping_address         text not null,
  shipping_address_detail  text,
  shipping_zipcode         text,
  shipping_memo            text,

  -- 무통장입금
  depositor_name           text not null,                  -- 입금자명

  -- 배송
  tracking_number          text,                           -- 송장번호 (admin 입력)

  -- 타임스탬프
  created_at               timestamptz not null default now(),
  paid_at                  timestamptz,
  shipped_at               timestamptz,
  delivered_at             timestamptz,
  cancelled_at             timestamptz
);

create index orders_status_idx       on public.orders(status);
create index orders_created_at_idx   on public.orders(created_at desc);
create index orders_order_number_idx on public.orders(order_number);
create index orders_phone_last4_idx  on public.orders(phone_last4);

-- ─────────────────────────────────────────────────────────────────
-- 4. order_items (결제 시점 스냅샷)
-- ─────────────────────────────────────────────────────────────────
-- 카테고리·상품이 나중에 바뀌어도 주문서는 그대로 유지되도록 핵심 표시
-- 데이터를 모두 컬럼·jsonb 로 복사 저장한다. FK 는 보조 용도.
create table public.order_items (
  id                uuid primary key default uuid_generate_v4(),
  order_id          uuid not null references public.orders(id) on delete cascade,

  -- 상품 참조 (보조)
  product_id        uuid references public.products(id)   on delete set null,
  category_id       uuid references public.categories(id) on delete set null,

  -- 스냅샷
  product_slug      text not null,
  product_name      text not null,
  thumbnail_url     text,
  unit_price        int  not null check (unit_price >= 0),
  quantity          int  not null check (quantity > 0),
  selected_options  jsonb not null default '[]'::jsonb,    -- [{name, value, price_delta}]
  custom_data       jsonb,                                  -- 명함 입력값 등
  subtotal          int  not null check (subtotal >= 0)
);

create index order_items_order_id_idx    on public.order_items(order_id);
create index order_items_product_id_idx  on public.order_items(product_id);
create index order_items_category_id_idx on public.order_items(category_id);

-- ─────────────────────────────────────────────────────────────────
-- 5. deposits (무통장 입금 확인 기록)
-- ─────────────────────────────────────────────────────────────────
-- depositor_name 은 orders 에 두고, 여기는 확인 메타만 보관.
create table public.deposits (
  id              uuid primary key default uuid_generate_v4(),
  order_id        uuid unique not null references public.orders(id) on delete cascade,
  expected_amount int  not null check (expected_amount >= 0),
  bank_name       text,
  account_number  text,
  confirmed       boolean not null default false,
  confirmed_at    timestamptz,
  confirmed_by    uuid references auth.users(id) on delete set null,
  memo            text,
  created_at      timestamptz not null default now()
);

create index deposits_confirmed_idx on public.deposits(confirmed);
create index deposits_order_id_idx  on public.deposits(order_id);

-- ─────────────────────────────────────────────────────────────────
-- 6. qna_posts (Q&A 게시판 — 비회원 작성)
-- ─────────────────────────────────────────────────────────────────
-- password_hash: 비회원이 자기 글을 수정·삭제할 때 검증용. 서버 액션에서
-- bcrypt 등으로 해시·검증한다. RLS 단계에서는 비밀번호 검증을 하지 않는다.
-- is_secret: 비밀글. anon SELECT 는 허용하되 본문 마스킹은 앱 단에서 처리.
create table public.qna_posts (
  id            uuid primary key default uuid_generate_v4(),
  author_name   text not null,
  password_hash text not null,
  title         text not null,
  content       text not null,
  is_secret     boolean not null default false,
  is_answered   boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index qna_posts_created_at_idx  on public.qna_posts(created_at desc);
create index qna_posts_is_answered_idx on public.qna_posts(is_answered);

create trigger qna_posts_updated_at
  before update on public.qna_posts
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────
-- 7. qna_replies (관리자 답변, 1:N)
-- ─────────────────────────────────────────────────────────────────
create table public.qna_replies (
  id         uuid primary key default uuid_generate_v4(),
  post_id    uuid not null references public.qna_posts(id) on delete cascade,
  author_id  uuid references auth.users(id) on delete set null,    -- 관리자
  content    text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index qna_replies_post_id_idx    on public.qna_replies(post_id);
create index qna_replies_created_at_idx on public.qna_replies(created_at desc);

create trigger qna_replies_updated_at
  before update on public.qna_replies
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────
-- 8. reviews (상품 후기 — 비회원 작성)
-- ─────────────────────────────────────────────────────────────────
create table public.reviews (
  id            uuid primary key default uuid_generate_v4(),
  product_id    uuid not null references public.products(id) on delete cascade,
  author_name   text not null,
  password_hash text not null,
  rating        int  not null check (rating between 1 and 5),
  title         text,
  content       text not null,
  is_visible    boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index reviews_product_id_idx on public.reviews(product_id);
create index reviews_created_at_idx on public.reviews(created_at desc);
create index reviews_is_visible_idx on public.reviews(is_visible);

create trigger reviews_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

-- ========================================================================
-- 함수 — 주문번호 자동 생성: ORD-YYYYMMDD-NNNN (KST 기준, 같은 날 시퀀스)
-- ========================================================================
create or replace function public.generate_order_number()
returns text as $$
declare
  today_str         text;
  sequence_num      int;
  new_order_number  text;
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
-- Row Level Security
-- ------------------------------------------------------------------------
-- 비회원 사이트 정책:
--   - anon SELECT: categories(active), products(active), qna_posts,
--     qna_replies, reviews(visible), orders/order_items/deposits 도 임시 허용
--     (Phase 1 — 클라이언트가 phone_last4 로 검증. Phase 2 에서 좁힌다)
--   - anon INSERT: orders, order_items, deposits, qna_posts, reviews
--   - 모든 UPDATE / DELETE / 관리용 SELECT: authenticated (= admin)
-- ========================================================================

-- ── categories ──────────────────────────────────────────────────
alter table public.categories enable row level security;

create policy "categories anon read active"
  on public.categories for select
  to anon, authenticated
  using (is_active = true);

create policy "categories admin all"
  on public.categories for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ── products ────────────────────────────────────────────────────
alter table public.products enable row level security;

create policy "products anon read active"
  on public.products for select
  to anon, authenticated
  using (is_active = true);

create policy "products admin read all"
  on public.products for select
  to authenticated
  using (public.is_admin());

create policy "products admin write"
  on public.products for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ── orders ──────────────────────────────────────────────────────
alter table public.orders enable row level security;

create policy "orders anon insert"
  on public.orders for insert
  to anon, authenticated
  with check (true);

-- Phase 1: anon SELECT 허용 (클라이언트가 phone_last4 + order_number 매칭)
create policy "orders anon read"
  on public.orders for select
  to anon, authenticated
  using (true);

create policy "orders admin update"
  on public.orders for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "orders admin delete"
  on public.orders for delete
  to authenticated
  using (public.is_admin());

-- ── order_items ─────────────────────────────────────────────────
alter table public.order_items enable row level security;

create policy "order_items anon insert"
  on public.order_items for insert
  to anon, authenticated
  with check (true);

create policy "order_items anon read"
  on public.order_items for select
  to anon, authenticated
  using (true);

create policy "order_items admin update"
  on public.order_items for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "order_items admin delete"
  on public.order_items for delete
  to authenticated
  using (public.is_admin());

-- ── deposits ────────────────────────────────────────────────────
alter table public.deposits enable row level security;

create policy "deposits anon insert"
  on public.deposits for insert
  to anon, authenticated
  with check (true);

create policy "deposits anon read"
  on public.deposits for select
  to anon, authenticated
  using (true);

create policy "deposits admin update"
  on public.deposits for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "deposits admin delete"
  on public.deposits for delete
  to authenticated
  using (public.is_admin());

-- ── qna_posts ───────────────────────────────────────────────────
alter table public.qna_posts enable row level security;

create policy "qna_posts anon read"
  on public.qna_posts for select
  to anon, authenticated
  using (true);

create policy "qna_posts anon insert"
  on public.qna_posts for insert
  to anon, authenticated
  with check (true);

create policy "qna_posts admin update"
  on public.qna_posts for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "qna_posts admin delete"
  on public.qna_posts for delete
  to authenticated
  using (public.is_admin());

-- ── qna_replies ─────────────────────────────────────────────────
-- 답변은 관리자만 작성·수정·삭제. 조회는 anon 허용.
alter table public.qna_replies enable row level security;

create policy "qna_replies anon read"
  on public.qna_replies for select
  to anon, authenticated
  using (true);

create policy "qna_replies admin write"
  on public.qna_replies for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ── reviews ─────────────────────────────────────────────────────
alter table public.reviews enable row level security;

create policy "reviews anon read visible"
  on public.reviews for select
  to anon, authenticated
  using (is_visible = true);

create policy "reviews admin read all"
  on public.reviews for select
  to authenticated
  using (public.is_admin());

create policy "reviews anon insert"
  on public.reviews for insert
  to anon, authenticated
  with check (true);

create policy "reviews admin update"
  on public.reviews for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "reviews admin delete"
  on public.reviews for delete
  to authenticated
  using (public.is_admin());

-- ========================================================================
-- 끝.  적용 후 확인:
--   1) Supabase Dashboard → Table Editor 에 8개 테이블이 보이는지
--      (categories, products, orders, order_items, deposits,
--       qna_posts, qna_replies, reviews)
--   2) categories 테이블에 8행이 들어가 있는지 (slug: business-card …)
-- ========================================================================
