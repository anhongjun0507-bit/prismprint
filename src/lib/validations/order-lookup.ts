import { z } from "zod";

/**
 * 비회원 주문 조회 폼 스키마.
 * 주문번호(ORD-YYYYMMDD-NNNN) + 휴대폰 뒤 4자리 숫자.
 *
 * Phase 2엔 server-side로 옮겨져 같은 스키마를 Server Action에서 재사용한다.
 */
export const orderLookupSchema = z.object({
  order_number: z
    .string()
    .min(1, "주문번호를 입력해주세요")
    .regex(
      /^ORD-\d{8}-\d{4}$/,
      "ORD-YYYYMMDD-NNNN 형식의 주문번호를 입력해주세요",
    ),
  phone_last4: z
    .string()
    .min(1, "휴대폰 뒤 4자리를 입력해주세요")
    .regex(/^\d{4}$/, "숫자 4자리를 정확히 입력해주세요"),
});

export type OrderLookupFormData = z.infer<typeof orderLookupSchema>;
