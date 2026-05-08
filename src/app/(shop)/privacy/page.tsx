import type { ReactNode } from "react";

import { siteConfig } from "@/lib/site-config";

export const metadata = {
  title: "개인정보처리방침",
};

export default function PrivacyPage() {
  const { company, customerService, policy } = siteConfig;

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 leading-relaxed md:py-12">
      <header className="mb-8 border-b pb-6">
        <h1 className="text-2xl font-bold md:text-3xl">개인정보처리방침</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          시행일: {policy.effectiveDate}
        </p>
      </header>

      <div className="space-y-8 text-sm text-foreground/90">
        <Section title="제1조 (총칙)">
          <p>
            {company.name}(이하 “회사”)은 「개인정보 보호법」 등 관련 법령을
            준수하며, 이용자의 개인정보를 보호하기 위하여 본 개인정보처리방침을
            수립·공개합니다.
          </p>
        </Section>

        <Section title="제2조 (수집하는 개인정보 항목)">
          <p>회사는 인쇄물 주문 처리를 위해 다음의 개인정보를 수집합니다.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>받는 사람 성명, 휴대폰 번호, 배송 주소(우편번호·상세주소)</li>
            <li>입금자명, 주문 금액, 입금 은행 정보</li>
            <li>주문 상품 정보 및 옵션, 명함 등 개별 인쇄에 필요한 입력 정보
              (성명·직책·부서·연락처)</li>
            <li>주문 확인·배송 안내를 위한 이메일 주소(선택 입력 시)</li>
            <li>고객센터 문의 시 제공하는 본인 식별 정보(이름·연락처·문의 내용)</li>
          </ul>
        </Section>

        <Section title="제3조 (개인정보의 수집 방법)">
          <p>
            회사는 다음의 방법으로 개인정보를 수집합니다: 주문서 작성, 고객센터
            전화·이메일 상담, Q&amp;A 게시판 작성. 회사는 회원가입 절차를 운영하지
            않으며, 비회원 주문 시 입력된 정보만을 보관합니다.
          </p>
        </Section>

        <Section title="제4조 (개인정보의 이용 목적)">
          <ul className="list-disc space-y-1 pl-5">
            <li>주문·결제·배송 처리 및 본인 확인</li>
            <li>인쇄물 제작에 필요한 디자인 정보 반영</li>
            <li>주문 확인·입금 확인·배송 시작 등 거래 관련 안내</li>
            <li>고객 문의 응대 및 분쟁 해결</li>
            <li>법령에 따른 거래 기록 보존</li>
          </ul>
        </Section>

        <Section title="제5조 (개인정보의 보유·이용 기간)">
          <p>
            회사는 수집한 개인정보를 수집·이용 목적이 달성된 후에는 지체 없이
            파기합니다. 다만, 다음의 정보는 「전자상거래 등에서의 소비자보호에
            관한 법률」 등 관련 법령에 따라 일정 기간 보관합니다.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>계약 또는 청약철회에 관한 기록: 5년</li>
            <li>대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
            <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
          </ul>
        </Section>

        <Section title="제6조 (개인정보의 제3자 제공)">
          <p>
            회사는 이용자의 개인정보를 제2조의 이용 목적 범위 내에서만 처리하며,
            법령에 의한 경우를 제외하고는 이용자의 사전 동의 없이 외부에 제공하지
            않습니다.
          </p>
        </Section>

        <Section title="제7조 (개인정보 처리의 위탁)">
          <p>
            회사는 원활한 서비스 제공을 위하여 다음 업체에 개인정보 처리를
            위탁하고 있으며, 위탁 계약 시 「개인정보 보호법」에 따라 안전한 관리를
            위한 사항을 명시하고 있습니다.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong>Supabase</strong> — 데이터베이스·인증·파일 저장소
              (주문·배송·문의 데이터의 보관)
            </li>
            <li>
              <strong>Resend</strong> — 주문 확인·입금 확인·배송 안내 이메일 발송
            </li>
            <li>
              <strong>택배사</strong> — 주문 상품의 배송 (수령인 성명·연락처·주소
              제공)
            </li>
          </ul>
        </Section>

        <Section title="제8조 (이용자의 권리·의무 및 행사 방법)">
          <p>
            이용자는 언제든지 본인의 개인정보 열람·정정·삭제·처리정지를 요청할
            수 있습니다. 요청은 고객센터를 통하여 가능하며, 회사는 본인 확인
            절차를 거친 후 지체 없이 처리합니다.
          </p>
        </Section>

        <Section title="제9조 (개인정보의 안전성 확보 조치)">
          <ul className="list-disc space-y-1 pl-5">
            <li>개인정보 접근 권한의 최소화 및 접근 통제</li>
            <li>개인정보 보관 데이터베이스의 암호화 및 접근 기록 보존</li>
            <li>개인정보 처리 위탁사에 대한 보안 점검</li>
            <li>해킹·악성코드 등에 대비한 시스템 보안 조치</li>
          </ul>
        </Section>

        <Section title="제10조 (개인정보 보호책임자)">
          <p>
            회사는 이용자의 개인정보를 보호하고 개인정보와 관련한 불만을 처리하기
            위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
          </p>
          <p className="mt-2 text-muted-foreground">
            성명: {company.ceo}
            <br />
            연락처: {customerService.phone} ({customerService.hours})
            <br />
            이메일: {customerService.email}
          </p>
        </Section>

        <Section title="제11조 (개정 고지)">
          <p>
            본 개인정보처리방침은 시행일로부터 적용되며, 법령 또는 정책 변경에
            따라 내용이 변경되는 경우 시행일 7일 전부터 공지합니다.
          </p>
        </Section>
      </div>

      <footer className="mt-12 border-t pt-6 text-xs text-muted-foreground">
        <p>{company.name} · 대표자 {company.ceo}</p>
        <p>사업자등록번호 {company.businessNumber}</p>
        <p>{company.address}</p>
      </footer>
    </article>
  );
}

interface SectionProps {
  title: string;
  children: ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-bold text-foreground md:text-lg">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
