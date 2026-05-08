import { z } from "zod";

/**
 * 주문서 작성 폼 스키마.
 *
 * - 비회원 주문이라 user_id 없음.
 * - 휴대폰: 010-XXXX-XXXX (하이픈 옵션, regex가 둘 다 허용).
 * - 이메일: 영수증·확인 메일용. 선택 필드 — 빈 문자열 허용.
 * - 주소: Daum 우편번호 SDK 연결 전이라 자유 입력. mock 채움 함수가 도와준다.
 * - 약관 2개: 둘 다 true여야 form.formState.isValid가 true가 된다.
 */
export const checkoutSchema = z.object({
  recipient_name: z.string().min(1, "성명을 입력해주세요"),
  recipient_phone: z
    .string()
    .min(1, "휴대폰 번호를 입력해주세요")
    .regex(
      /^010-?\d{4}-?\d{4}$/,
      "010-0000-0000 형식으로 입력해주세요",
    ),
  recipient_email: z
    .string()
    .email("올바른 이메일 형식이 아닙니다")
    .or(z.literal(""))
    .optional(),

  shipping_zipcode: z.string().min(1, "우편번호를 입력해주세요"),
  shipping_address: z.string().min(1, "기본 주소를 입력해주세요"),
  shipping_address_detail: z.string().or(z.literal("")).optional(),
  shipping_memo: z.string().or(z.literal("")).optional(),

  depositor_name: z.string().min(1, "입금자명을 입력해주세요"),

  agreed_terms: z.boolean().refine((v) => v === true, {
    message: "이용약관에 동의해주세요",
  }),
  agreed_privacy: z.boolean().refine((v) => v === true, {
    message: "개인정보처리방침에 동의해주세요",
  }),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
