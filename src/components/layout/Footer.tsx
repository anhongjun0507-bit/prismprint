import Link from "next/link";

// TODO(Phase 2): 회사 정보·계좌·고객센터 데이터를 site_settings 테이블에서 조회.
// 지금은 모두 placeholder.

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-3">
        <section className="space-y-3 text-sm">
          <h3 className="text-base font-semibold text-foreground">
            회사 정보
          </h3>
          <dl className="space-y-1 text-muted-foreground">
            <FooterRow label="상호" value="(주)프린트샵" />
            <FooterRow label="대표" value="홍길동" />
            <FooterRow label="사업자번호" value="000-00-00000" />
            <FooterRow label="주소" value="서울특별시 ○○구 ○○로 123, 4층" />
            <FooterRow label="이메일" value="contact@printshop.example" />
          </dl>
        </section>

        <section className="space-y-3 text-sm">
          <h3 className="text-base font-semibold text-foreground">
            고객센터
          </h3>
          <dl className="space-y-1 text-muted-foreground">
            <FooterRow label="전화" value="02-0000-0000" />
            <FooterRow
              label="운영시간"
              value="평일 09:00 - 18:00 (주말·공휴일 휴무)"
            />
            <FooterRow label="점심시간" value="12:00 - 13:00" />
          </dl>
          <p className="text-xs text-muted-foreground">
            주문·결제 문의는 이메일 또는 전화로 부탁드립니다.
          </p>
        </section>

        <section className="space-y-3 text-sm">
          <h3 className="text-base font-semibold text-foreground">
            무통장입금 계좌
          </h3>
          <dl className="space-y-1 text-muted-foreground">
            <FooterRow label="은행" value="○○은행" />
            <FooterRow label="계좌번호" value="000-000000-00-000" />
            <FooterRow label="예금주" value="(주)프린트샵" />
          </dl>
          <p className="text-xs text-muted-foreground">
            주문 후 24시간 이내 입금하지 않으면 자동 취소됩니다.
          </p>
        </section>
      </div>

      <div className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-4 py-4 text-xs text-muted-foreground md:flex-row md:items-center">
          <nav
            aria-label="고객 지원"
            className="flex flex-wrap items-center gap-x-4 gap-y-1"
          >
            <Link
              href="/order/lookup"
              className="hover:text-foreground"
            >
              주문 조회
            </Link>
            <Link href="/qna" className="hover:text-foreground">
              Q&amp;A
            </Link>
            <Link href="/faq" className="hover:text-foreground">
              자주 묻는 질문
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              이용약관
            </Link>
            <Link
              href="/privacy"
              className="font-medium hover:text-foreground"
            >
              개인정보처리방침
            </Link>
          </nav>
          <p>© {year} 프린트샵. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

interface FooterRowProps {
  label: string;
  value: string;
}

function FooterRow({ label, value }: FooterRowProps) {
  return (
    <div className="flex gap-3">
      <dt className="w-20 shrink-0 text-muted-foreground/70">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
