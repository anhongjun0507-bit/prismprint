/**
 * 8종 고정 카테고리 코드 상수.
 *
 * Header / MobileMenu / CategoryNav / CategoryShowcase 등 메뉴 노출에 사용한다.
 * DB의 `public.categories` 테이블 8개 행과 slug·name·display_order 가 1:1
 * 동일하게 유지되어야 한다 (id 만 다름). 메뉴 단에선 DB 조회 없이도 일관된
 * 라벨·라우팅을 보장한다.
 *
 * 카테고리 추가/변경은 (1) 이 상수 → (2) supabase/migrations 의 categories
 * 시드 → 두 곳을 함께 수정한다.
 */

import type { Category } from "@/types";

// 코드 상수 전용 메타데이터를 Category 위에 얹는다.
// requiresCustomData: 주문 시 받는 사람 정보(성명·직책·부서·연락처) 등
// 추가 입력 폼이 필요한 카테고리. 명함이 대표 케이스.
export interface CategoryConstant extends Category {
  requiresCustomData: boolean;
}

const NOW = "2026-05-08T00:00:00.000Z";

export const categories: CategoryConstant[] = [
  {
    id: "cat_business_card",
    slug: "business-card",
    name: "명함 제작",
    description: "일반·고급·양면 명함 인쇄",
    display_order: 1,
    is_active: true,
    requiresCustomData: true,
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
    requiresCustomData: false,
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
    requiresCustomData: false,
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
    requiresCustomData: false,
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
    requiresCustomData: false,
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
    requiresCustomData: false,
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
    requiresCustomData: false,
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
    requiresCustomData: false,
    created_at: NOW,
    updated_at: NOW,
  },
];

export function getCategoryConstant(slug: string): CategoryConstant | undefined {
  return categories.find((c) => c.slug === slug);
}

export function categoryRequiresCustomData(slug: string): boolean {
  return getCategoryConstant(slug)?.requiresCustomData ?? false;
}
