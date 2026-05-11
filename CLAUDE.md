# PrismPrint — 사내 인쇄물 주문몰

## 프로젝트 개요

A기업 직원 전용 인쇄물(명함·팜플릿·카탈로그) 주문 사이트.
NHN 고도몰 같은 임대 솔루션이 아니라 **풀스택 커스텀 개발**로 진행한다.
디디몰(ddmall.com)의 카테고리 구조·UX 흐름을 참고하되 자체 시스템으로 구축한다.

- 클라이언트: 백승주
- 작업자: 프리즘 (안홍준)
- 상품 수: 약 20종
- 결제: **무통장입금 전용** (PG 연동 없음)
- 회원: **회원가입 미운영, 비회원 주문 전용**. 일반 사용자 로그인/회원가입 페이지는 만들지 않는다. Supabase Auth는 admin 1인 로그인 용도로만 사용.

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

마이그레이션 파일은 `supabase/migrations/` 에 있고 **002_revised_schema.sql 이 현재 상태의 정의**이다 (001 은 deprecated). 카테고리는 `public.categories` 테이블과 `src/lib/categories.ts` **코드 상수(8종 고정)** 에서 이중 관리된다 — slug·name·display_order 가 1:1 동기화되어야 하며, 메뉴 노출은 코드 상수, 단일 카테고리 조회는 DB 테이블을 쓴다. 카테고리 추가/변경 시 양쪽을 함께 수정한다.

**확정 테이블 (8개)**:
- `categories` — 카테고리 (코드 상수와 동기, 8행 시드)
- `products` — 상품 마스터. `category_id` FK. 이미지·옵션은 별도 테이블이 아닌 `images` / `options` jsonb 컬럼으로 통합
- `orders` — 주문 (status: pending_payment | paid | preparing | shipping | delivered | cancelled). **`user_id` 컬럼 없음** — 비회원 주문이므로 `phone_last4` + `order_number` 로 본인 확인
- `order_items` — 주문 상품 스냅샷 (product_name·unit_price·thumbnail_url 결제 시점 보존, `selected_options` / `custom_data` jsonb)
- `deposits` — 무통장 입금 정보 (admin이 수동 확인). `confirmed_by` 는 `auth.users` FK
- `qna_posts` — Q&A 게시판 질문 (작성자명 + `password_hash`, `is_secret` 옵션)
- `qna_replies` — Q&A 답변 (admin 작성, `auth.users` FK)
- `reviews` — 상품 후기 (작성자명 + `password_hash`, 별점 1–5, `is_visible` 토글)

**테이블이 아닌 것** (앞선 설계에서 도입했다가 002에서 제거):
- ~~`users`~~ → admin 1명만 운영하므로 별도 프로필 테이블을 두지 않는다. `auth.users` 의 row 가 곧 admin. RLS 헬퍼 `public.is_admin()` = `auth.uid() is not null` 단순 정책
- ~~`product_images`, `product_options`~~ → `products.images`, `products.options` jsonb 통합
- ~~`carts`~~ → 브라우저 zustand (`src/lib/stores/cart-store.ts`) 가 단일 저장소, DB 사용하지 않음
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
│   ├── (shop)/                  # 일반 사용자 페이지 (모두 비회원 접근)
│   │   ├── categories/[slug]/   # 카테고리별 상품 목록
│   │   ├── products/[slug]/     # 상품 상세 (후기는 여기 탭으로 노출)
│   │   ├── cart/                # 장바구니
│   │   ├── checkout/            # 주문서
│   │   ├── order/complete/      # 주문 완료 + 무통장입금 안내
│   │   ├── order/lookup/        # 비회원 주문 조회 (주문번호 + 휴대폰 끝 4자리)
│   │   ├── search/              # 상품명 검색
│   │   ├── qna/                 # Q&A 게시판
│   │   ├── faq/                 # FAQ 정적 페이지
│   │   ├── privacy/             # 개인정보처리방침
│   │   └── terms/               # 이용약관
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

모든 DB 테이블에 Row Level Security 활성화. 정책은 002 마이그레이션 참고. 비회원 사이트라 admin 판별은 `public.is_admin() = auth.uid() is not null` 헬퍼 한 줄로 단순화 (auth 에는 admin 1명만 등록). 본인 검증(비회원 글 삭제 등)은 RLS 가 아닌 server action 에서 비밀번호 해시 검증 + `createAdminClient()` (service-role) 로 우회.
- `categories`, `products`: anon SELECT (`is_active=true`), admin 전체 권한
- `orders`, `order_items`, `deposits`: anon INSERT 허용, anon SELECT 도 허용(임시) — 본인 조회는 server action 이 `order_number` + `phone_last4` 매칭으로 1차 가드. admin 만 UPDATE/DELETE
- `qna_posts`: anon SELECT/INSERT 모두 허용. 비공개 글 본문 노출 가드는 앱 단에서. UPDATE/DELETE 는 admin
- `qna_replies`: anon SELECT, admin 만 작성·수정·삭제
- `reviews`: anon SELECT (`is_visible=true`) + INSERT. 본인 삭제는 비밀번호 검증 후 service-role 우회. admin 이 노출 토글·전체 조회·삭제

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

1. **`/admin/login`** — Supabase Auth 로그인 (auth.users 에 admin 1명만 등록되어 있음. 별도 role 컬럼 없이 `is_admin()` 헬퍼가 로그인 여부만 체크)
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

- **Q&A 게시판** (`/qna`) — 비회원 작성 (작성자명 + 비밀번호). 비공개 옵션 시 비밀번호 검증 후 본문 노출. admin이 답변 작성
- **상품 후기** — 상품 상세(`/products/[slug]`) 안의 후기 탭으로만 노출 (별도 `/reviews` 라우트 없음). 비회원 작성 (작성자명 + 비밀번호 + 별점 + 본문). 본인 삭제는 비밀번호 검증. admin이 노출/숨김 제어
- **FAQ** (`/faq`) — 정적 페이지 1장. JSX에 직접 작성, DB 없음
- **공지사항** — 사용 안 함

게시판 두 개의 admin UI는 `/admin/board` 한 페이지의 탭으로 통합한다.

## 개발 진행 순서

Week별 로드맵을 따라간다. 순서를 바꾸지 않는다.

1. **Week 1**: 프로젝트 셋업, Supabase 연결, admin Auth, 기본 레이아웃
2. **Week 2**: 상품 목록·상세, 카테고리·검색
3. **Week 3**: 장바구니, 주문서, 주문 생성 (비회원)
4. **Week 4**: 비회원 주문 조회 (`/order/lookup`), 이메일 발송 (Resend)
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

---

## 코드 컨벤션 (구 `.cursor/rules/project.mdc` 흡수)

### Import 순서

```typescript
// 1. React, Next.js
import { useState } from "react";
import Link from "next/link";

// 2. 외부 라이브러리
import { z } from "zod";
import { useForm } from "react-hook-form";

// 3. 내부 lib
import { createClient } from "@/lib/supabase/server";

// 4. 컴포넌트
import { Button } from "@/components/ui/button";

// 5. 타입
import type { Product } from "@/types";
```

### 파일 명명

- 컴포넌트: `PascalCase.tsx` (예: `ProductCard.tsx`)
- 유틸·훅: `camelCase.ts` (예: `formatPrice.ts`, `useCart.ts`)
- 라우트: Next.js 규칙 (`page.tsx`, `layout.tsx`, `loading.tsx`)
- 타입: `index.ts`, `database.ts`

### 컴포넌트 작성

- `default export` 대신 **named export** 우선 (라우트 파일 제외 — 라우트는 Next.js 규칙상 default)
- Props 는 `interface XxxProps` 로 정의
- 본문 200줄 넘으면 하위 컴포넌트로 분리

### 가격 표시 유틸 (필수)

```typescript
// src/lib/utils.ts
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("ko-KR").format(price) + "원";
}
```

화면에 가격 표시할 때는 항상 이 함수 사용. `${price}원` 같은 인라인 금지.

### 절대 하지 말 것

- ❌ `<img>` 태그 (Next.js `<Image>` 만)
- ❌ `localStorage` 직접 접근 (SSR 에러). 필요하면 `useEffect` 안에서만
- ❌ `fetch` 로 자체 API 호출 (Server Component 에서는 Supabase 직접 호출)
- ❌ 인라인 스타일 `style={{...}}` — Tailwind 클래스만
- ❌ 전역 CSS 추가 — `globals.css` 거의 안 건드림
- ❌ `default export` 함수 컴포넌트 (라우트 파일 제외)
- ❌ DB 컬럼명 카멜케이스 변환 — DB 는 snake_case 그대로 사용
- ❌ `console.log` 프로덕션 잔류 (개발 중만)
- ❌ `class` 컴포넌트 (함수형만)

### 새 기능 추가 체크리스트

1. DB 변경 필요? → `supabase/migrations/` 에 새 SQL 파일 추가
2. 타입 업데이트 필요? → `npm run supabase:types` 실행
3. 새 라이브러리 필요? → **사용자에게 확인 받고** 설치
4. RLS 정책 수정 필요? → 마이그레이션 파일에 명시
5. shadcn 컴포넌트 추가 필요? → `npx shadcn@2.10.0 add <name>` (4.x 는 Tailwind v4 + Base UI 라 깨짐)

---

## 개발 환경 — Codespaces / Devcontainer

- **로컬 / Codespaces 공통**: Node 20+, `npm install` 후 `npm run dev` → http://localhost:3000
- **Devcontainer** (`.devcontainer/devcontainer.json`) 가 기본 세팅을 한다:
  - Node 20 base image, ESLint·Prettier·Tailwind·Supabase 확장 자동 설치
  - 포트 3000 (Next), 54321~54324 (Supabase 로컬) 자동 포워드
- **환경변수**:
  - 로컬: `.env.local` (커밋 금지, `.gitignore` 에 등록됨)
  - Codespaces: GitHub Settings → Codespaces secrets 에 등록 (값은 컨테이너 시작 시 자동 주입)
- **주요 명령어**:
  - `npm run dev` — 개발 서버 (Turbopack)
  - `npm run build` / `npm start` — 프로덕션 빌드/실행
  - `npm run lint` — ESLint
  - `npm run type-check` — `tsc --noEmit`
  - `npm run supabase:start|stop|reset` — Supabase 로컬
  - `npm run supabase:types` — DB 스키마 → `src/types/database.ts` 자동 생성
