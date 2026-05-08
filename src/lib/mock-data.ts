/**
 * mock 카테고리 — Header / MobileMenu / CategoryNav / CategoryShowcase 가
 * 정적 카테고리 목록을 필요로 할 때 사용한다.
 *
 * slug·name·display_order 는 DB `public.categories` 테이블의 8개 행과
 * 1:1 동일하게 유지한다 (id 만 다름). 메뉴 노출 용도라 DB 조회 없이도
 * 일관된 라벨·라우팅을 보장한다.
 *
 * 상품(products) 데이터와 관련 헬퍼는 모두 Supabase 로 이전됨
 * → src/lib/supabase/queries/products.ts
 */

import type { Category } from "@/types";

const NOW = "2026-05-08T00:00:00.000Z";

export const mockCategories: Category[] = [
  {
    id: "cat_business_card",
    slug: "business-card",
    name: "명함 제작",
    description: "일반·고급·양면 명함 인쇄",
    display_order: 1,
    is_active: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "cat_sticker",
    slug: "sticker",
    name: "스티커 제작",
    description: "원형·사각·도무송 스티커",
    display_order: 2,
    is_active: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "cat_coupon",
    slug: "coupon",
    name: "쿠폰 제작",
    description: "할인·이벤트용 쿠폰",
    display_order: 3,
    is_active: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "cat_flyer",
    slug: "flyer",
    name: "전단지 제작",
    description: "A4·A5·B5 전단지",
    display_order: 4,
    is_active: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "cat_poster",
    slug: "poster",
    name: "포스터",
    description: "A2·A1 대형 포스터",
    display_order: 5,
    is_active: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "cat_mini_banner",
    slug: "mini-banner",
    name: "미니배너",
    description: "탁상용 미니 X·거치형 배너",
    display_order: 6,
    is_active: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "cat_banner",
    slug: "banner",
    name: "배너",
    description: "실외 현수막·X·롤배너",
    display_order: 7,
    is_active: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "cat_sash",
    slug: "sash",
    name: "어깨띠",
    description: "행사·광고용 어깨띠",
    display_order: 8,
    is_active: true,
    created_at: NOW,
    updated_at: NOW,
  },
];
