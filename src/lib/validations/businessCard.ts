import { z } from "zod";

/**
 * 명함 주문 시 받는 사람 정보 (custom_data jsonb 필드에 저장).
 * Phase 2 checkout Server Action에서도 동일 스키마를 재사용한다.
 */
export const businessCardCustomDataSchema = z.object({
  recipient_name: z.string().min(1, "성명을 입력해주세요"),
  position: z.string().min(1, "직책을 입력해주세요"),
  department: z.string().min(1, "부서를 입력해주세요"),
  phone: z
    .string()
    .min(1, "휴대폰 번호를 입력해주세요")
    .regex(/^010-?\d{4}-?\d{4}$/, "010-0000-0000 형식으로 입력해주세요"),
  email: z
    .string()
    .min(1, "이메일을 입력해주세요")
    .email("올바른 이메일 형식이 아닙니다"),
});

export type BusinessCardCustomData = z.infer<
  typeof businessCardCustomDataSchema
>;
