# PrismPrint — 사내 인쇄물 주문몰

A기업 직원 전용 인쇄물(명함·팜플릿·카탈로그) 주문 사이트.
Next.js 15 + Supabase + Tailwind 풀스택 커스텀 개발.

---

## 셋업 가이드 (처음 한 번만)

### 1. Cursor에서 프로젝트 열기

이 폴더 전체를 Cursor로 엽니다. `CLAUDE.md` 와 `.cursor/rules/` 가 자동으로 인식됩니다.

### 2. Next.js 프로젝트 초기화

이 폴더는 설정 파일만 있는 상태입니다. Next.js 보일러플레이트를 추가해야 합니다.

```bash
# 현재 폴더에 Next.js 추가 (모든 옵션 yes)
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

질문이 나오면 다음과 같이 답합니다:
- TypeScript: **Yes**
- ESLint: **Yes**
- Tailwind CSS: **Yes**
- `src/` directory: **Yes**
- App Router: **Yes**
- Turbopack: **Yes**
- import alias `@/*`: **Yes**

기존 `package.json`을 덮어쓸지 묻는다면 **No** (이미 만들어둔 게 있음).

### 3. 의존성 설치

```bash
npm install
```

### 4. shadcn/ui 초기화

```bash
npx shadcn@latest init
```

옵션:
- Style: **New York**
- Base color: **Slate**
- CSS variables: **Yes**

자주 쓸 컴포넌트 미리 설치:

```bash
npx shadcn@latest add button input label form select textarea card dialog dropdown-menu table tabs toast
```

### 5. Supabase CLI 설치 + 로그인

```bash
# macOS
brew install supabase/tap/supabase

# 또는 npm
npm install -g supabase

# 로그인
supabase login
```

### 6. Supabase 프로젝트 생성

1. https://supabase.com/dashboard 접속
2. **New Project** 클릭 → 프로젝트 이름 `prismprint`, 비밀번호 설정
3. 리전: **Northeast Asia (Seoul)** 추천
4. 생성 완료까지 2~3분 대기

### 7. 환경변수 설정

```bash
cp .env.local.example .env.local
```

Supabase 대시보드 → **Settings → API** 에서 다음 값을 복사해 `.env.local` 에 입력:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ 절대 클라이언트 노출 금지)

### 8. DB 마이그레이션 적용

**옵션 A — Supabase Dashboard에서 직접 실행** (간단함):

1. Supabase 대시보드 → **SQL Editor**
2. `supabase/migrations/001_initial_schema.sql` 내용을 복사해서 붙여넣고 **Run**

**옵션 B — CLI로 적용**:

```bash
# 프로젝트 링크
supabase link --project-ref <YOUR_PROJECT_REF>

# 마이그레이션 푸시
supabase db push
```

### 9. 타입 자동 생성

```bash
# 프로젝트 ID는 Supabase 대시보드 URL 에서 확인
supabase gen types typescript --project-id <YOUR_PROJECT_ID> > src/types/database.ts
```

### 10. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 접속.

---

## 폴더 구조

```
prismprint/
├── CLAUDE.md                       # Claude Code 컨텍스트
├── .cursor/rules/project.mdc       # Cursor 규칙
├── .env.local.example
├── package.json
├── README.md (이 파일)
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # 11개 테이블 + RLS
└── src/                            # Next.js 코드 (셋업 후 생성됨)
    ├── app/
    ├── components/
    ├── lib/
    └── types/
```

---

## 개발 로드맵 (6주)

| 주차 | 내용 |
|------|------|
| Week 1 | 기초 인프라·인증·레이아웃 |
| Week 2 | 상품 시스템 (목록·상세·카테고리) |
| Week 3 | 장바구니·주문·무통장입금 |
| Week 4 | 마이페이지·이메일 발송 |
| Week 5 | 관리자 페이지 (가장 큰 영역) |
| Week 6 | 약관·반응형·테스트·배포 |

자세한 내용은 `CLAUDE.md` 참고.

---

## Cursor에서 Claude Code 활용 팁

### 첫 작업 명령 예시

```
@CLAUDE.md 를 읽고 Week 1 Day 1 작업을 진행하자.
src/lib/supabase/ 폴더에 client.ts, server.ts, middleware.ts 를 만들어줘.
@supabase/ssr 패키지를 사용하고, Next.js 15 App Router 패턴을 따라줘.
```

### 자주 쓸 명령 패턴

- `src/components/shop/ProductCard.tsx 를 만들어줘. @CLAUDE.md 의 디자인 톤을 참고해서 디디몰 스타일로.`
- `src/app/(shop)/products/page.tsx 에서 Supabase로 활성 상품 목록을 조회하고 ProductCard로 그리드 표시. RLS 이미 적용되어 있으니 그냥 select 만 호출하면 돼.`
- `현재 폴더 구조를 보고 누락된 디렉토리가 있으면 만들어줘.`

### 주의

- Claude Code가 새 라이브러리를 설치하려고 하면 한 번 멈추고 확인하세요
- DB 스키마 변경이 필요하면 새 마이그레이션 파일을 만들고 절대 기존 파일을 수정하지 마세요
- `any` 타입을 쓰려고 하면 거부하고 명시적 타입을 요청하세요

---

## 배포 (Week 6)

1. GitHub 저장소 생성 → 코드 푸시
2. https://vercel.com 에서 **Import Project** → GitHub 저장소 선택
3. 환경변수 입력 (`.env.local` 의 모든 키)
4. **Deploy**
5. 도메인 연결: Settings → Domains
