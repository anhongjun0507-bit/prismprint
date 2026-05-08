-- ========================================================================
-- 004 — Supabase Storage: products 버킷 + RLS 정책
-- ========================================================================
-- 적용 시점: admin 상품 관리 기능을 사용하기 직전.
-- Dashboard SQL Editor 에 붙여넣고 Run.
-- ========================================================================

-- 1) products 버킷 생성 (public 읽기, 5MB 제한, 이미지 MIME 제한)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'products',
  'products',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public           = excluded.public,
      file_size_limit  = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 2) RLS 정책
-- 누구나 읽기 (next/image 와 익명 사용자가 상품 이미지를 봄)
drop policy if exists "products_public_read" on storage.objects;
create policy "products_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'products');

-- authenticated (= admin) 만 쓰기·수정·삭제
drop policy if exists "products_admin_insert" on storage.objects;
create policy "products_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'products');

drop policy if exists "products_admin_update" on storage.objects;
create policy "products_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'products')
  with check (bucket_id = 'products');

drop policy if exists "products_admin_delete" on storage.objects;
create policy "products_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'products');

-- ========================================================================
-- 검증:
--   select id, name, public from storage.buckets where id = 'products';
--   → public=true, 1행 기대
-- ========================================================================
