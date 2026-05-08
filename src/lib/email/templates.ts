import { siteConfig } from "@/lib/site-config";

interface OrderItemMini {
  product_name: string;
  quantity: number;
  subtotal: number;
}

const formatPrice = (n: number) =>
  new Intl.NumberFormat("ko-KR").format(n) + "원";

function wrapTemplate(title: string, body: string): string {
  return `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><title>${title}</title></head>
<body style="margin:0;padding:24px;background:#f7f7f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans KR',sans-serif;color:#111;">
  <table role="presentation" align="center" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#fff;border-radius:8px;border:1px solid #e5e5e5;">
    <tr><td style="padding:24px 28px;">
      <h1 style="margin:0 0 6px 0;font-size:18px;font-weight:700;">${title}</h1>
      <p style="margin:0;color:#666;font-size:13px;">${siteConfig.company.name}</p>
      <hr style="margin:16px 0;border:none;border-top:1px solid #e5e5e5;">
      ${body}
      <hr style="margin:20px 0;border:none;border-top:1px solid #e5e5e5;">
      <p style="margin:0;color:#888;font-size:12px;line-height:1.6;">
        고객센터 ${siteConfig.customerService.phone} · ${siteConfig.customerService.email}<br>
        ${siteConfig.company.name} · 사업자등록번호 ${siteConfig.company.businessNumber}
      </p>
    </td></tr>
  </table>
</body></html>`;
}

function itemsTable(items: OrderItemMini[]): string {
  const rows = items
    .map(
      (i) => `<tr>
        <td style="padding:6px 0;">${i.product_name}</td>
        <td style="padding:6px 0;text-align:right;">${i.quantity}개</td>
        <td style="padding:6px 0;text-align:right;font-weight:600;">${formatPrice(i.subtotal)}</td>
      </tr>`,
    )
    .join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:13px;border-top:1px solid #eee;border-bottom:1px solid #eee;margin:8px 0;">${rows}</table>`;
}

// ─────────────────────────────────────────
// 1) 주문 접수
// ─────────────────────────────────────────
export interface OrderCreatedTemplate {
  orderNumber: string;
  recipientName: string;
  totalAmount: number;
  depositorName: string;
  items: OrderItemMini[];
}

export function orderCreatedEmail(t: OrderCreatedTemplate) {
  const body = `
    <p style="margin:0 0 12px 0;font-size:14px;">${t.recipientName} 님, 주문이 정상적으로 접수되었습니다.</p>
    <p style="margin:0 0 4px 0;font-size:13px;color:#666;">주문번호</p>
    <p style="margin:0 0 16px 0;font-family:monospace;font-size:15px;font-weight:700;">${t.orderNumber}</p>
    ${itemsTable(t.items)}
    <p style="margin:8px 0 16px 0;text-align:right;font-size:14px;">
      총 결제 금액 <strong style="font-size:16px;">${formatPrice(t.totalAmount)}</strong>
    </p>
    <div style="background:#f3f7fc;border:1px solid #d6e4f5;border-radius:6px;padding:14px 16px;font-size:13px;line-height:1.7;">
      <strong>무통장입금 안내</strong><br>
      ${siteConfig.bank.name} ${siteConfig.bank.accountNumber} (예금주 ${siteConfig.bank.holder})<br>
      입금자명 <strong>${t.depositorName}</strong> · 주문 후 24시간 이내 입금하지 않으면 자동 취소됩니다.
    </div>
  `;
  return {
    subject: `[${siteConfig.company.name}] 주문이 접수되었습니다 (${t.orderNumber})`,
    html: wrapTemplate("주문 접수 안내", body),
  };
}

// ─────────────────────────────────────────
// 2) 입금 확인
// ─────────────────────────────────────────
export interface DepositConfirmedTemplate {
  orderNumber: string;
  recipientName: string;
}

export function depositConfirmedEmail(t: DepositConfirmedTemplate) {
  const body = `
    <p style="margin:0 0 8px 0;font-size:14px;">${t.recipientName} 님, 입금이 확인되었습니다.</p>
    <p style="margin:0 0 16px 0;font-size:13px;color:#444;">곧 제작이 시작되며, 출고 시 송장번호를 별도 안내드립니다.</p>
    <p style="margin:0 0 4px 0;font-size:13px;color:#666;">주문번호</p>
    <p style="margin:0;font-family:monospace;font-size:15px;font-weight:700;">${t.orderNumber}</p>
  `;
  return {
    subject: `[${siteConfig.company.name}] 입금이 확인되었습니다 (${t.orderNumber})`,
    html: wrapTemplate("입금 확인 완료", body),
  };
}

// ─────────────────────────────────────────
// 3) 배송 시작
// ─────────────────────────────────────────
export interface ShippingStartedTemplate {
  orderNumber: string;
  recipientName: string;
  trackingNumber: string | null;
}

export function shippingStartedEmail(t: ShippingStartedTemplate) {
  const body = `
    <p style="margin:0 0 8px 0;font-size:14px;">${t.recipientName} 님, 주문하신 상품이 출고되었습니다.</p>
    ${
      t.trackingNumber
        ? `<p style="margin:0 0 4px 0;font-size:13px;color:#666;">송장번호</p>
           <p style="margin:0 0 16px 0;font-family:monospace;font-size:15px;font-weight:700;">${t.trackingNumber}</p>`
        : ""
    }
    <p style="margin:0 0 4px 0;font-size:13px;color:#666;">주문번호</p>
    <p style="margin:0;font-family:monospace;font-size:15px;font-weight:700;">${t.orderNumber}</p>
  `;
  return {
    subject: `[${siteConfig.company.name}] 배송이 시작되었습니다 (${t.orderNumber})`,
    html: wrapTemplate("배송 시작 안내", body),
  };
}
