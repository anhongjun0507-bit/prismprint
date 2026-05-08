import { clsx, type ClassValue } from "clsx";
import { addHours, format, isSameDay } from "date-fns";
import { ko } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("ko-KR").format(price) + "원";
}

/**
 * 주문 생성 시각으로부터 24시간 뒤를 입금 기한으로 반환.
 * Phase 2엔 site_settings의 deposit_window_hours 같은 값으로 가변화.
 */
export function calculateDepositDeadline(createdAt: string): Date {
  return addHours(new Date(createdAt), 24);
}

/**
 * 입금 기한을 한국어로 자연스럽게 표시.
 *  - 오늘이면 "오늘 18:00 까지"
 *  - 내일이면 "내일 14:30 까지"
 *  - 그 외: "2026년 5월 9일 18:00 까지"
 */
export function formatDeadline(
  deadline: Date,
  now: Date = new Date(),
): string {
  const tomorrow = addHours(now, 24);
  const time = format(deadline, "HH:mm", { locale: ko });

  if (isSameDay(deadline, now)) {
    return `오늘 ${time} 까지`;
  }
  if (isSameDay(deadline, tomorrow)) {
    return `내일 ${time} 까지`;
  }
  return `${format(deadline, "yyyy년 M월 d일 HH:mm", { locale: ko })} 까지`;
}
