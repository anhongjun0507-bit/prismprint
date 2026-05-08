# PrismPrint — 사내 인쇄물 주문몰

## 프로젝트 개요

A기업 직원 전용 인쇄물(명함·팜플릿·카탈로그) 주문 사이트.
NHN 고도몰 같은 임대 솔루션이 아니라 **풀스택 커스텀 개발**로 진행한다.
디디몰(ddmall.com)의 카테고리 구조·UX 흐름을 참고하되 자체 시스템으로 구축한다.

- 클라이언트: 백승주
- 작업자: 프리즘 (안홍준)
- 상품 수: 약 20종
- 결제: **무통장입금 전용** (PG 연동 없음)
- 회원: 일반 회원가입 (특별 권한 없음)

## 기술 스택 (확정)

- **프레임워크**: Next.js 15 (App Router) + TypeScript (strict)
- **스타일**: Tailwind CSS + shadcn/ui
- **DB·인증·스토리지**: Supabase (PostgreSQL + Auth + Storage)
- **이메일**: Resend
- **배포**: Vercel
- **유효성 검증**: Zod
- **폼 관리**: React Hook Form
- **상태 관리**: Zustand (장바구니 등 클라이언트 상태) + Server Components 기본

다른 라이브러리를 추가할 때는 반드시 사용자에게 확인을 받는다.

## DB 스키마 (절대 임의 변경 금지)

마이그레이션 파일은 `supabase/migrations/` 에 있다. 카테고리는 DB 테이블이 아니라 **코드 상수(8종 고정)** 로 관리한다.

**확정 테이블 (8개)**:
- `users` — 회원 (role: customer | admin)
- `products` — 상품 마스터 (`category_slug` 컬럼이 코드 상수와 연결)
- `product_images` — 상품 이미지 (다중)
- `product_options` — 옵션 (수량·디자인 등)
- `carts` — 장바구니
- `orders` — 주문 (status: pending_payment | paid | preparing | shipping | delivered | cancelled)
- `order_items` — 주문 상품 스냅샷 (product_name·unit_price 등 결제 시점 보존)
- `deposits` — 무통장 입금 정보 (admin이 수동 확인)

**다음 마이그레이션에서 추가될 테이블 (2개)**:
- `qna_posts` — Q&A 게시판 (질문 + admin 답변, 비공개 옵션)
- `product_reviews` — 상품 후기 (별점 + 본문, 결제 완료 회원만 작성)

**제거된 테이블** (이전 설계에서 빠진 것):
- ~~`categories`~~ → 코드 상수 (`src/lib/categories.ts` 또는 mock-data)
- ~~`site_settings`~~ → 환경변수 (`.env.local`)
- ~~`notices`~~ → 공지사항 게시판 자체 제거

**중요한 설계 원칙**:
- `order_items`는 주문 시점 스냅샷이다. `product_name`·`unit_price`를 반드시 복사 저장한다. 이후 상품 정보가 바뀌어도 주문서는 결제 시점 그대로다.
- `custom_data jsonb` 필드: 명함 주문 시 받는 사람 정보(성명·직책·부서·연락처)를 유연하게 저장한다.
- 가격은 **모두 정수형(원 단위)** 이다. `int` 타입을 쓰고 절대 `float`·`numeric`을 쓰지 않는다.
- 시간은 **모두 `timestamptz`** (UTC 저장, 표시 시 KST 변환).

## 환경변수 (.env.local)

사이트 설정(회사명·계좌·고객센터 등)은 DB가 아닌 환경변수로 관리한다. 변경 빈도가 낮아 재배포로 충분하고, 관리자 화면을 한 페이지 줄일 수 있다.

**클라이언트 노출** (`NEXT_PUBLIC_` 접두):
- `NEXT_PUBLIC_COMPANY_NAME` — 상호 (예: "(주)프린트샵")
- `NEXT_PUBLIC_COMPANY_CEO` — 대표자명
- `NEXT_PUBLIC_COMPANY_BUSINESS_NUMBER` — 사업자등록번호
- `NEXT_PUBLIC_COMPANY_ADDRESS` — 사업장 주소
- `NEXT_PUBLIC_COMPANY_EMAIL` — 대표 이메일
- `NEXT_PUBLIC_COMPANY_PHONE` — 고객센터 전화
- `NEXT_PUBLIC_COMPANY_HOURS` — 운영시간 (예: "평일 09:00 - 18:00")
- `NEXT_PUBLIC_BANK_NAME` — 입금 은행
- `NEXT_PUBLIC_BANK_ACCOUNT_NUMBER` — 계좌번호
- `NEXT_PUBLIC_BANK_ACCOUNT_HOLDER` — 예금주

**서버 전용**:
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — Supabase 연결
- `RESEND_API_KEY` — 이메일 발송

읽을 때는 `src/lib/site-config.ts` wrapper 한 곳에서만 환경변수를 파싱해 export한다. Footer·결제 안내·이메일 템플릿 등 사용처는 wrapper만 import (직접 `process.env.NEXT_PUBLIC_...` 참조 금지).

## 폴더 구조 규칙

```
src/
├── app/                # Next.js App Router 라우트
│   ├── (shop)/                  # 일반 사용자 페이지
│   │   ├── categories/[slug]/   # 카테고리별 상품 목록
│   │   ├── products/[slug]/     # 상품 상세
│   │   ├── cart/                # 장바구니
│   │   ├── checkout/            # 주문서
│   │   ├── qna/                 # Q&A 게시판
│   │   ├── reviews/             # 상품 후기
│   │   └── faq/                 # FAQ 정적 페이지
│   ├── (auth)/         # 로그인/회원가입
│   ├── admin/          # 관리자 4개 페이지 (RLS + middleware 보호)
│   │   ├── login/
│   │   ├── orders/              # 주문 관리 + 입금 확인 + 상단 카운트
│   │   ├── products/            # 상품 관리
│   │   └── board/               # Q&A·후기 통합 관리
│   └── api/            # API 라우트
├── components/
│   ├── ui/             # shadcn/ui 원본 (수정 금지)
│   ├── shop/           # 쇼핑몰 비즈니스 컴포넌트
│   ├── admin/          # 관리자 비즈니스 컴포넌트
│   └── layout/         # Header, Footer 등
├── lib/
│   ├── supabase/       # Supabase 클라이언트 (client/server/middleware 분리)
│   ├── validations/    # Zod 스키마
│   ├── categories.ts   # 8종 카테고리 코드 상수
│   ├── site-config.ts  # 환경변수 wrapper (회사·계좌·고객센터)
│   └── utils.ts
├── types/
│   ├── index.ts        # 도메인 타입
│   └── database.ts     # Supabase 자동 생성 타입 (직접 편집 금지)
└── middleware.ts       # admin 라우트 보호
```

## 코드 작성 규칙

### Supabase 클라이언트 사용

- **Server Component / Server Action**: `import { createClient } from "@/lib/supabase/server"`
- **Client Component**: `import { createClient } from "@/lib/supabase/client"`
- **Middleware**: `import { updateSession } from "@/lib/supabase/middleware"`

이 분리를 절대 섞지 않는다. Server Component에서 client용 함수를 import하면 빌드 에러가 난다.

### Server Component 우선

기본적으로 모든 페이지·컴포넌트는 Server Component로 작성한다. 다음 경우에만 `"use client"` 를 쓴다:
- 이벤트 핸들러 (onClick, onChange 등)
- React hooks (useState, useEffect)
- 브라우저 API (localStorage, window)

### Form 처리

- 모든 form은 React Hook Form + Zod로 처리
- 제출은 Server Action으로
- 에러 메시지는 한국어

### 보안 (RLS)

모든 DB 테이블에 Row Level Security 활성화. 정책은 마이그레이션 파일 참고.
- `users`: 본인 정보만 읽기·수정
- `orders`, `order_items`, `carts`: 본인 것만 접근
- `products`, `product_images`, `product_options`: 누구나 조회, admin만 수정
- `deposits`: admin 전용
- `qna_posts`: 공개 글은 누구나 조회, 비공개 글은 작성자·admin만. 답변은 admin만
- `product_reviews`: 노출 처리된 글은 누구나 조회, 결제 완료 회원만 작성, admin이 노출 토글

### 에러 처리

- DB 에러는 try/catch로 잡고 사용자에게는 한국어 메시지 표시
- 절대 raw error를 사용자에게 노출하지 않는다
- 로깅은 `console.error`로 (프로덕션에서는 Vercel 로그)

### 가격·통화 표시

- DB는 정수(원)
- 화면 표시는 `Intl.NumberFormat('ko-KR').format(price)` + "원" 사용
- 절대 `toLocaleString()` 같은 방식으로 통화 기호 자동 처리하지 않는다 (브라우저별 차이)

## 주요 비즈니스 로직

### 주문 생성 흐름

1. 사용자가 장바구니에서 "주문하기" 클릭
2. `/checkout` 페이지에서 받는 사람 정보·배송지 입력
3. Server Action에서 트랜잭션으로 처리:
   - `orders` 레코드 생성 (status: `pending_payment`)
   - 각 장바구니 항목을 `order_items` 로 스냅샷 복사
   - `deposits` 레코드 생성 (입금 대기)
   - `carts` 비우기
   - 주문 확인 이메일 발송 (Resend)
4. 사용자에게 무통장입금 안내 페이지 표시 (계좌·금액·입금자명)

### 입금 확인 흐름 (admin)

1. admin이 `/admin/orders` 페이지의 미입금 탭에서 미확인 입금 목록 조회
2. 실제 통장 확인 후 "입금 확인" 버튼 클릭
3. Server Action에서:
   - `deposits.confirmed = true`
   - `orders.status = 'paid'`, `paid_at = now()`
   - 입금 확인 이메일 발송

### 주문번호 생성

`ORD-YYYYMMDD-XXXX` 형식 (예: `ORD-20260508-0001`).
같은 날짜 내 시퀀스는 PostgreSQL 함수로 처리.

## 관리자 페이지 (4개로 한정)

관리자 1명(클라이언트 또는 위임자) 운영을 가정한다. 페이지는 다음 4개로만 한정한다.

1. **`/admin/login`** — Supabase Auth + `users.role = 'admin'` 체크
2. **`/admin/orders`** — 주문 관리 + 입금 확인. 페이지 상단에 미입금/처리중/완료 카운트 카드 (별도 대시보드 페이지 없음). 입금 확인 흐름은 위 "입금 확인 흐름 (admin)" 참고
3. **`/admin/products`** — 상품 마스터·이미지·옵션 CRUD. 카테고리는 코드 상수에서 select만 (편집 불가)
4. **`/admin/board`** — Q&A 답변 + 상품 후기 노출/숨김. 두 게시판을 탭으로 한 페이지에서 처리

**제거된 admin 페이지** (이전 설계에서 빠진 것):
- 대시보드 → `/admin/orders` 상단 카운트로 흡수
- 카테고리 관리 → 코드 상수로 고정
- 공지사항 → 게시판 자체 제거
- FAQ 관리 → `/faq` 정적 페이지
- 사이트 설정 → `.env.local`
- 후기 관리(분리) → 게시판 관리에 통합

## 게시판 (2개 + 정적 1개)

- **Q&A 게시판** (`/qna`) — 회원/비회원 모두 작성 가능. 비공개 옵션. admin이 답변 작성
- **상품 후기** (`/reviews`, 또는 상품 상세 안 별도 탭) — 결제 완료 회원만 작성. 별점 + 본문. admin이 노출/숨김 제어
- **FAQ** (`/faq`) — 정적 페이지 1장. JSX에 직접 작성, DB 없음
- **공지사항** — 사용 안 함

게시판 두 개의 admin UI는 `/admin/board` 한 페이지의 탭으로 통합한다.

## 개발 진행 순서

Week별 로드맵을 따라간다. 순서를 바꾸지 않는다.

1. **Week 1**: 프로젝트 셋업, Supabase 연결, 인증 (회원가입·로그인), 기본 레이아웃
2. **Week 2**: 상품 목록·상세, 카테고리·검색
3. **Week 3**: 장바구니, 주문서, 주문 생성
4. **Week 4**: 마이페이지, 주문 조회, 이메일 발송
5. **Week 5**: 관리자 4개 페이지 (login·orders·products·board) + Q&A·후기 게시판
6. **Week 6**: 약관·정책 페이지, FAQ 정적 페이지, 반응형 점검, 테스트, 배포

## 작업할 때 지킬 것

- **TypeScript strict 모드** — `any` 금지. 불가피하면 주석으로 이유 명시
- **컴포넌트는 작게** — 200줄 넘으면 분리
- **한국어 주석·메시지** — 사용자 노출 텍스트는 모두 한국어
- **반응형은 모바일 우선** — Tailwind 기본이 mobile-first
- **이미지 최적화** — Next.js `<Image>` 컴포넌트 필수, `<img>` 금지
- **테스트는 수동** — 자동 테스트는 시간상 후순위

## 디자인 톤

디디몰 참고. 다음 mockup PDF의 톤을 따른다:
- 네이비(`#1a4d7a`) 액센트
- 화이트 베이스
- 산세리프 (Pretendard 또는 Noto Sans KR)
- 깔끔한 카드형 상품 진열
- 명함 주문 시 옵션 입력 폼 강조
