import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata = {
  title: "자주 묻는 질문",
};

interface FaqItem {
  q: string;
  a: string;
}

interface FaqGroup {
  title: string;
  items: FaqItem[];
}

const FAQ_GROUPS: FaqGroup[] = [
  {
    title: "주문",
    items: [
      {
        q: "회원가입 없이 주문할 수 있나요?",
        a: "네, 본 사이트는 비회원 주문만 운영합니다. 주문 시 입력한 휴대폰 번호 끝 4자리와 주문번호로 주문 내역을 조회할 수 있습니다.",
      },
      {
        q: "주문 후 디자인 시안 수정은 가능한가요?",
        a: "입금 확인 후 제작이 시작되기 전까지는 고객센터로 연락 주시면 시안 교체·수정이 가능합니다. 제작 시작 후에는 변경이 어렵습니다.",
      },
      {
        q: "주문을 취소하고 싶어요.",
        a: "입금 전이면 자동 취소되므로 별도 조치가 필요하지 않습니다. 입금 후라도 제작 시작 전까지는 고객센터에 연락 주시면 전액 환불해 드립니다.",
      },
      {
        q: "한 번에 여러 종류의 인쇄물을 주문할 수 있나요?",
        a: "장바구니에 서로 다른 카테고리의 상품을 함께 담아 한 번에 주문하실 수 있습니다.",
      },
    ],
  },
  {
    title: "결제",
    items: [
      {
        q: "결제 수단은 무엇이 있나요?",
        a: "현재는 무통장입금만 지원합니다. 신용카드·간편결제 등은 운영하지 않습니다.",
      },
      {
        q: "주문 후 며칠 안에 입금해야 하나요?",
        a: "주문 후 24시간 이내에 입금해 주셔야 합니다. 시간 내 입금이 확인되지 않으면 주문은 자동으로 취소됩니다.",
      },
      {
        q: "입금 확인은 언제 되나요?",
        a: "영업일(평일 09:00~18:00) 기준 즉시~당일 내 확인됩니다. 점심시간·주말·공휴일에 입금하시면 다음 영업일에 확인됩니다.",
      },
      {
        q: "입금자명을 잘못 입력했어요.",
        a: "고객센터로 입금일자·금액·실제 입금자명을 알려주시면 수동으로 매칭해 드립니다.",
      },
      {
        q: "세금계산서 발행 가능한가요?",
        a: "사업자등록증 사본을 이메일로 보내 주시면 입금 확인 후 세금계산서를 발행해 드립니다.",
      },
    ],
  },
  {
    title: "배송",
    items: [
      {
        q: "배송은 얼마나 걸리나요?",
        a: "입금 확인 후 영업일 기준 2~5일 내 제작이 완료되며, 출고 후 택배 배송에 1~2일이 추가로 소요됩니다.",
      },
      {
        q: "당일 출고도 가능한가요?",
        a: "수량·후가공에 따라 다르지만 당일 출고는 어렵습니다. 급한 일정이 있으시면 주문 전 고객센터로 문의 주세요.",
      },
      {
        q: "배송 조회는 어떻게 하나요?",
        a: "출고 시 송장번호가 등록되며, 주문 조회 페이지에서 휴대폰 번호 끝 4자리와 주문번호를 입력하시면 송장번호를 확인할 수 있습니다.",
      },
      {
        q: "배송지 변경은 어디서 하나요?",
        a: "출고 전이라면 고객센터로 연락 주시면 변경해 드립니다. 출고 이후에는 택배사를 통해 직접 요청하셔야 합니다.",
      },
    ],
  },
  {
    title: "환불·교환",
    items: [
      {
        q: "단순 변심으로 환불 가능한가요?",
        a: "주문 후 7일 이내라도 이미 제작이 시작된 경우 청약철회가 제한됩니다. 제작 시작 전이라면 전액 환불됩니다.",
      },
      {
        q: "인쇄 오류·파손 배송된 경우는요?",
        a: "회사 귀책으로 발생한 문제는 무료로 재제작·재배송해 드립니다. 수령 후 7일 이내 사진과 함께 고객센터로 접수해 주세요.",
      },
      {
        q: "환불은 언제 입금되나요?",
        a: "환불 결정 후 영업일 기준 3일 이내에 주문 시 입금하신 계좌로 송금됩니다.",
      },
    ],
  },
  {
    title: "기타",
    items: [
      {
        q: "디자인 파일은 어떻게 보내나요?",
        a: "주문 후 안내 메일로 파일 업로드 링크가 발송됩니다. AI·PDF·PSD 형식을 권장합니다.",
      },
      {
        q: "디자인 의뢰도 가능한가요?",
        a: "현재는 디자인 시안 의뢰 서비스를 운영하지 않습니다. 완성된 인쇄용 파일만 접수합니다.",
      },
      {
        q: "대량 주문 할인이 있나요?",
        a: "일정 수량 이상 주문 시 별도 견적이 가능합니다. 고객센터로 수량·일정·요청사항을 알려 주세요.",
      },
      {
        q: "전화 상담 시간은 어떻게 되나요?",
        a: "평일 09:00 - 18:00 (12:00 - 13:00 점심시간 제외) 운영합니다. 주말·공휴일에는 이메일로 문의 주시면 다음 영업일에 답변드립니다.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <header className="mb-8 border-b pb-6">
        <h1 className="text-2xl font-bold md:text-3xl">자주 묻는 질문</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          주문·결제·배송에 관해 자주 받는 질문을 모았습니다. 더 궁금한 점은
          고객센터로 문의 주세요.
        </p>
      </header>

      <div className="space-y-10">
        {FAQ_GROUPS.map((group) => (
          <section key={group.title} className="space-y-3">
            <h2 className="text-lg font-bold md:text-xl">{group.title}</h2>
            <Accordion type="single" collapsible className="w-full">
              {group.items.map((item, index) => (
                <AccordionItem
                  key={item.q}
                  value={`${group.title}-${index}`}
                >
                  <AccordionTrigger className="text-left text-sm md:text-base">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))}
      </div>
    </div>
  );
}
