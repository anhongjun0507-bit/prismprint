/**
 * 사이트 설정값 한 곳에서 모아 export.
 * Footer·결제 안내·이메일 템플릿·약관·개인정보처리방침 사용처는 이 wrapper만 import한다.
 *
 * Next.js 클라이언트 번들에서 NEXT_PUBLIC_* 환경변수가 정적으로 치환되려면
 * `process.env.LITERAL_NAME` 형태로 직접 접근해야 한다 (동적 인덱싱 불가).
 *
 * TODO(Phase 2): site_settings 테이블 조회로 교체.
 *   - server-only async getter로 변환
 *   - 클라이언트는 RSC props로 값을 받도록 ProductDetailClient 패턴 적용
 *   - 그 시점엔 fallback 상수도 제거 가능
 */
export const siteConfig = {
  company: {
    name: process.env.NEXT_PUBLIC_COMPANY_NAME ?? "주식회사 예시",
    ceo: process.env.NEXT_PUBLIC_COMPANY_CEO ?? "홍길동",
    businessNumber:
      process.env.NEXT_PUBLIC_COMPANY_BUSINESS_NUMBER ?? "000-00-00000",
    address:
      process.env.NEXT_PUBLIC_COMPANY_ADDRESS ?? "서울특별시 ○○구 ○○로 123",
    email: process.env.NEXT_PUBLIC_COMPANY_EMAIL ?? "contact@example.com",
  },
  bank: {
    name: process.env.NEXT_PUBLIC_BANK_NAME ?? "우리은행",
    accountNumber:
      process.env.NEXT_PUBLIC_BANK_ACCOUNT ?? "000-000-000000",
    holder: process.env.NEXT_PUBLIC_BANK_HOLDER ?? "홍길동",
  },
  customerService: {
    phone: process.env.NEXT_PUBLIC_CS_PHONE ?? "02-0000-0000",
    email: process.env.NEXT_PUBLIC_CS_EMAIL ?? "cs@example.com",
    hours: process.env.NEXT_PUBLIC_COMPANY_HOURS ?? "평일 09:00 - 18:00",
  },
  policy: {
    // 약관·개인정보처리방침 시행일. 변경 시 두 페이지에 동시 반영된다.
    effectiveDate: "2026-05-08",
  },
} as const;
