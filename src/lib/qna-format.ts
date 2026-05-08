import { format } from "date-fns";
import { ko } from "date-fns/locale";

// 작성자 이름 마스킹: "홍길동" → "홍**", "김철" → "김*", "김" → "김"
export function maskAuthorName(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length <= 1) return trimmed;
  return trimmed[0] + "*".repeat(trimmed.length - 1);
}

export function formatQnaDate(iso: string): string {
  return format(new Date(iso), "yyyy.MM.dd HH:mm", { locale: ko });
}

export function formatQnaDateShort(iso: string): string {
  return format(new Date(iso), "yyyy.MM.dd", { locale: ko });
}
