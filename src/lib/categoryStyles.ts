import {
  CreditCard,
  FileImage,
  Flag,
  Image as ImageIcon,
  Sparkles,
  Sticker,
  Ticket,
  type LucideIcon,
} from "lucide-react";

/**
 * 카테고리별 시각 자산 — 그라데이션 + 아이콘.
 *
 * 상품 썸네일이 비어 있는 동안 ProductCard / ProductGallery / CategoryShowcase
 * 의 placeholder 에 사용된다.
 *
 * 키는 카테고리 slug. mock 과 DB 가 같은 slug 를 쓰므로 양쪽에서 통용.
 *
 * Tailwind v3 content scanner 가 클래스 문자열을 스캔할 수 있도록
 * 동적 보간 없이 리터럴 문자열로 둔다.
 */

interface CategoryStyle {
  gradient: string;
  iconBg: string;
  iconColor: string;
  icon: LucideIcon;
}

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  "business-card": {
    gradient: "from-slate-100 via-slate-200 to-slate-300",
    iconBg: "bg-slate-700/10",
    iconColor: "text-slate-700",
    icon: CreditCard,
  },
  sticker: {
    gradient: "from-amber-50 via-amber-100 to-amber-200",
    iconBg: "bg-amber-600/15",
    iconColor: "text-amber-700",
    icon: Sticker,
  },
  coupon: {
    gradient: "from-emerald-50 via-emerald-100 to-emerald-200",
    iconBg: "bg-emerald-600/15",
    iconColor: "text-emerald-700",
    icon: Ticket,
  },
  flyer: {
    gradient: "from-sky-50 via-sky-100 to-sky-200",
    iconBg: "bg-sky-600/15",
    iconColor: "text-sky-700",
    icon: FileImage,
  },
  poster: {
    gradient: "from-rose-50 via-rose-100 to-rose-200",
    iconBg: "bg-rose-600/15",
    iconColor: "text-rose-700",
    icon: ImageIcon,
  },
  "mini-banner": {
    gradient: "from-violet-50 via-violet-100 to-violet-200",
    iconBg: "bg-violet-600/15",
    iconColor: "text-violet-700",
    icon: Sparkles,
  },
  banner: {
    gradient: "from-indigo-50 via-indigo-100 to-indigo-200",
    iconBg: "bg-indigo-600/15",
    iconColor: "text-indigo-700",
    icon: ImageIcon,
  },
  sash: {
    gradient: "from-orange-50 via-orange-100 to-orange-200",
    iconBg: "bg-orange-600/15",
    iconColor: "text-orange-700",
    icon: Flag,
  },
};

const FALLBACK: CategoryStyle = {
  gradient: "from-muted to-muted-foreground/10",
  iconBg: "bg-muted-foreground/10",
  iconColor: "text-muted-foreground",
  icon: ImageIcon,
};

export function getCategoryStyle(categorySlug: string): CategoryStyle {
  return CATEGORY_STYLES[categorySlug] ?? FALLBACK;
}

export function getCategoryGradient(categorySlug: string): string {
  return (CATEGORY_STYLES[categorySlug] ?? FALLBACK).gradient;
}

export function getCategoryIcon(categorySlug: string): LucideIcon {
  return (CATEGORY_STYLES[categorySlug] ?? FALLBACK).icon;
}
