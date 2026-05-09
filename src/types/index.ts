/**
 * PrismPrint 도메인 타입 정의
 *
 * - DB 컬럼명은 snake_case 그대로 사용 (CLAUDE.md 규칙)
 * - 가격은 모두 정수형 (원 단위)
 * - 시간은 ISO 8601 문자열 (timestamptz)
 */

// ============================================
// 카테고리
// ============================================

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// 상품
// ============================================

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt: string | null;
  display_order: number;
}

export interface ProductOptionValue {
  label: string;
  price_delta: number;
}

export interface ProductOption {
  id: string;
  product_id: string;
  name: string;
  values: ProductOptionValue[];
  display_order: number;
  is_required: boolean;
}

export interface Product {
  id: string;
  category_id: string;
  slug: string;
  name: string;
  description: string | null;
  base_price: number;
  thumbnail_url: string | null;
  images: ProductImage[];
  options: ProductOption[];
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// Supabase 쿼리에서 categories 를 join 해 함께 반환하는 형태.
// ProductCard·상품 상세에서 카테고리 표시·라우팅 시 사용.
export interface ProductWithCategory extends Product {
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

// ============================================
// 장바구니
// ============================================

export interface CartItem {
  id: string;
  product_id: string;
  product_slug: string;
  category_id: string;
  product_name: string;
  thumbnail_url: string | null;
  unit_price: number;
  quantity: number;
  subtotal: number;
  selected_options: Record<string, string>;
  custom_data: Record<string, unknown> | null;
  added_at: string;
}

// ============================================
// 주문 — DB row 타입은 Database["public"]["Tables"]["orders"]["Row"] 를 사용한다.
// 여기엔 status 라벨링 등 화면에서 자주 쓰는 enum 만 둔다.
// ============================================

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "preparing"
  | "shipping"
  | "delivered"
  | "cancelled";

// ============================================
// Q&A 게시판
// ============================================

// password_hash 는 클라이언트로 보내지 않는다. 쿼리 함수에서 select 시 제외.
export interface QnaPostPublic {
  id: string;
  author_name: string;
  title: string;
  content: string;
  is_secret: boolean;
  is_answered: boolean;
  created_at: string;
  updated_at: string;
}

// 목록용 — 본문은 보내지 않는다 (비밀글 leak 방지 + 페이로드 최소화).
export type QnaPostListItem = Omit<QnaPostPublic, "content" | "updated_at">;

export interface QnaReply {
  id: string;
  post_id: string;
  author_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// 상품 후기
// ============================================

// password_hash 는 클라이언트로 보내지 않는다. 쿼리에서 select 시 제외.
// author_name 은 서버 쿼리 단에서 마스킹된 형태로 채워진다.
export interface ReviewPublic {
  id: string;
  product_id: string;
  author_name: string;
  rating: number;
  title: string | null;
  content: string;
  is_visible: boolean;
  created_at: string;
}

// ============================================
// 무통장 입금
// ============================================

export interface Deposit {
  id: string;
  order_id: string;
  depositor_name: string;
  amount: number;
  expected_at: string | null;
  confirmed: boolean;
  confirmed_at: string | null;
  confirmed_by: string | null;
  created_at: string;
}
