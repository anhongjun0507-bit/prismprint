/**
 * 카테고리별 그라데이션 팔레트.
 *
 * 상품 썸네일이 비어 있는 동안 ProductCard / ProductGallery 의 placeholder 와
 * CategoryShowcase 의 카드 배경에 동일하게 사용한다.
 *
 * 키는 카테고리 slug 다 (DB 의 categories.slug 와 mock 의 slug 가 동일하므로
 * mock·DB 양쪽에서 같은 매핑을 사용할 수 있다).
 *
 * Tailwind v3 content scanner 가 클래스 문자열을 스캔할 수 있도록 동적 보간
 * 없이 리터럴 문자열로 둔다.
 */

const CATEGORY_GRADIENTS: Record<string, string> = {
  "business-card": "from-slate-200 to-slate-400",
  sticker: "from-amber-100 to-amber-300",
  coupon: "from-emerald-100 to-emerald-300",
  flyer: "from-sky-100 to-sky-300",
  poster: "from-rose-100 to-rose-300",
  "mini-banner": "from-violet-100 to-violet-300",
  banner: "from-indigo-100 to-indigo-300",
  sash: "from-orange-100 to-orange-300",
};

const FALLBACK_GRADIENT = "from-muted to-muted-foreground/20";

export function getCategoryGradient(categorySlug: string): string {
  return CATEGORY_GRADIENTS[categorySlug] ?? FALLBACK_GRADIENT;
}
