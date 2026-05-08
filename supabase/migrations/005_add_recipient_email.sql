-- ========================================================================
-- 005 — orders.recipient_email 컬럼 추가
-- ========================================================================
-- 비회원 주문에 이메일 영수증/입금 확인/배송 알림 메일 발송을 위한 필드.
-- 입력은 선택. 빈 문자열이면 NULL 로 저장.
-- ========================================================================

alter table public.orders
  add column if not exists recipient_email text;

-- 검증:
--   select column_name, data_type, is_nullable
--     from information_schema.columns
--    where table_schema = 'public' and table_name = 'orders' and column_name = 'recipient_email';
