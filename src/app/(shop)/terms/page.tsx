import type { ReactNode } from "react";

import { siteConfig } from "@/lib/site-config";

export const metadata = {
  title: "이용약관",
};

export default function TermsPage() {
  const { company, customerService, policy } = siteConfig;

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 leading-relaxed md:py-12">
      <header className="mb-8 border-b pb-6">
        <h1 className="text-2xl font-bold md:text-3xl">이용약관</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          시행일: {policy.effectiveDate}
        </p>
      </header>

      <div className="space-y-8 text-sm text-foreground/90">
        <Section title="제1조 (목적)">
          <p>
            본 약관은 {company.name}(이하 “회사”)가 운영하는 인쇄물 주문 사이트
            (이하 “서비스”)의 이용 조건과 절차, 회사와 이용자의 권리·의무 및
            책임사항을 규정함을 목적으로 합니다.
          </p>
        </Section>

        <Section title="제2조 (정의)">
          <ol className="list-decimal space-y-1 pl-5">
            <li>“서비스”란 회사가 제공하는 인쇄물 주문·결제·배송 관련 일체의
              온라인 서비스를 의미합니다.</li>
            <li>“이용자”란 본 약관에 따라 회사가 제공하는 서비스를 이용하는
              비회원 주문자를 의미합니다.</li>
            <li>“주문”이란 이용자가 서비스를 통하여 인쇄물 제작을 신청하고
              회사가 이를 승낙한 거래를 의미합니다.</li>
          </ol>
        </Section>

        <Section title="제3조 (약관의 명시·설명·개정)">
          <p>
            회사는 본 약관을 이용자가 쉽게 알 수 있도록 서비스 초기 화면에
            게시합니다. 회사는 「전자상거래 등에서의 소비자보호에 관한 법률」,
            「약관의 규제에 관한 법률」 등 관련 법령에 위배되지 않는 범위에서
            약관을 개정할 수 있으며, 개정 시 시행일 7일 전부터 공지합니다.
          </p>
        </Section>

        <Section title="제4조 (서비스의 제공 및 변경)">
          <p>
            회사는 다음의 업무를 수행합니다.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>인쇄물(명함·스티커·전단지·포스터·배너·어깨띠 등) 제작 주문 접수</li>
            <li>주문에 따른 디자인 검수, 인쇄, 후가공, 배송</li>
            <li>주문·결제·배송 정보의 안내 및 고객 응대</li>
          </ul>
        </Section>

        <Section title="제5조 (서비스의 중단)">
          <p>
            회사는 컴퓨터 등 정보통신설비의 보수점검·교체·고장, 통신 두절 또는
            운영상 상당한 이유가 있는 경우 서비스의 제공을 일시 중단할 수 있으며,
            그로 인하여 이용자에게 발생한 손해에 대해서는 회사의 고의 또는 중대한
            과실이 없는 한 책임지지 않습니다.
          </p>
        </Section>

        <Section title="제6조 (비회원 주문)">
          <p>
            본 서비스는 별도의 회원가입 절차 없이 비회원 형태로 주문을 접수합니다.
            이용자는 주문 시 입력한 연락처(휴대폰 번호 끝 4자리)와 주문번호로
            주문 내역을 조회할 수 있습니다.
          </p>
        </Section>

        <Section title="제7조 (이용자의 의무)">
          <ol className="list-decimal space-y-1 pl-5">
            <li>이용자는 주문 시 회사가 요구하는 정보를 정확하게 제공하여야 합니다.</li>
            <li>이용자는 타인의 정보를 도용하거나 허위 정보를 입력하여서는 안 됩니다.</li>
            <li>이용자는 디자인 파일에 제3자의 저작권·초상권·상표권을 침해하는
              내용을 포함하여서는 안 되며, 이로 인한 법적 책임은 이용자가 부담합니다.</li>
          </ol>
        </Section>

        <Section title="제8조 (구매 신청)">
          <p>
            이용자는 다음 절차에 따라 구매를 신청합니다.
          </p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>상품 선택 및 옵션·수량 입력</li>
            <li>장바구니 담기 또는 바로 주문</li>
            <li>받는 사람 정보·배송지·입금자명 입력</li>
            <li>약관 동의 후 주문 확정</li>
          </ol>
        </Section>

        <Section title="제9조 (결제 방법)">
          <p>
            본 서비스의 결제 수단은 <strong>무통장입금</strong>으로 한정합니다.
            주문 후 회사가 안내하는 계좌로 24시간 이내 입금하지 않을 경우 주문은
            자동으로 취소됩니다. PG·신용카드 등 다른 결제 수단은 제공하지 않습니다.
          </p>
        </Section>

        <Section title="제10조 (수신 확인 통지·구매 신청 변경·취소)">
          <p>
            회사는 이용자의 구매 신청이 있는 경우 이용자에게 수신 확인 안내를 합니다.
            이용자는 수신 확인 통지를 받은 후 입금 전까지 자유롭게 주문을 변경하거나
            취소할 수 있으며, 입금 후 제작 시작 전까지는 고객센터를 통하여 변경·취소를
            요청할 수 있습니다.
          </p>
        </Section>

        <Section title="제11조 (재화의 공급)">
          <p>
            회사는 이용자의 입금 확인 후 영업일 기준 2~5일 이내에 인쇄·제작을 완료하고
            택배로 발송합니다. 후가공·수량·시즌에 따라 일정이 변경될 수 있으며, 변경 시
            사전에 안내합니다.
          </p>
        </Section>

        <Section title="제12조 (청약철회 및 제작 시작 후 환불 제한)">
          <p>
            이용자는 「전자상거래 등에서의 소비자보호에 관한 법률」 제17조에 따라
            주문 후 7일 이내에 청약철회를 할 수 있습니다. 다만, 이용자의 주문에
            맞추어 개별적으로 생산되는 재화에 해당하므로, 다음의 경우 청약철회가
            제한될 수 있습니다.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>이용자가 제공한 디자인 시안에 따라 인쇄·제작이 시작된 경우</li>
            <li>이용자의 주문 정보(이름·연락처·디자인 등)가 인쇄에 반영되어
              재판매가 곤란한 경우</li>
            <li>맞춤형 후가공(박·양각·도무송 컷팅 등)이 적용된 경우</li>
          </ul>
        </Section>

        <Section title="제13조 (환불)">
          <p>
            제작 시작 전 청약철회의 경우 회사는 이용자가 입금한 금액 전액을 입금
            계좌로 환불합니다. 회사의 귀책사유(인쇄 오류·파손 배송 등)로 인한
            환불 또는 재제작은 회사 부담으로 처리합니다.
          </p>
        </Section>

        <Section title="제14조 (개인정보 보호)">
          <p>
            회사는 이용자의 개인정보를 「개인정보 보호법」 및 관련 법령에 따라
            적법하고 안전하게 처리합니다. 자세한 사항은 별도의{" "}
            <a href="/privacy" className="font-medium text-primary underline">
              개인정보처리방침
            </a>
            을 참고하시기 바랍니다.
          </p>
        </Section>

        <Section title="제15조 (분쟁 해결)">
          <p>
            회사는 이용자가 제기하는 정당한 의견이나 불만을 신속하게 처리하기
            위하여 고객센터를 운영합니다. 이용자의 피해가 신속히 처리되지 않을 경우
            소비자분쟁조정위원회의 분쟁조정 절차를 따를 수 있습니다.
          </p>
          <p className="mt-2 text-muted-foreground">
            고객센터: {customerService.phone} ({customerService.hours})
            <br />
            이메일: {customerService.email}
          </p>
        </Section>

        <Section title="제16조 (재판권 및 준거법)">
          <p>
            회사와 이용자 간 발생한 전자상거래 분쟁에 관한 소송은 제소 당시
            이용자의 주소에 의하고, 주소가 없는 경우 거소를 관할하는 지방법원의
            전속관할로 합니다. 본 약관의 해석 및 회사와 이용자 간의 분쟁에는
            대한민국 법령을 적용합니다.
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
