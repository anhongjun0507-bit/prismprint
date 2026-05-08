"use server";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/client";
import { orderCreatedEmail } from "@/lib/email/templates";

const SHIPPING_FEE = 3000;

// 클라이언트에서 받는 아이템 — product_id 와 quantity, 선택 옵션·커스텀 데이터만.
// 가격은 절대 신뢰하지 않고 서버에서 products 테이블 기준으로 재계산한다.
const orderItemInputSchema = z.object({
  product_id: z.string().uuid("상품 ID 형식이 올바르지 않습니다"),
  quantity: z.coerce.number().int().min(1, "수량은 1 이상이어야 합니다"),
  selected_options: z.record(z.string(), z.string()).default({}),
  custom_data: z.record(z.string(), z.unknown()).nullable().optional(),
});

const createOrderSchema = z.object({
  recipient_name: z.string().trim().min(1, "성명을 입력해주세요"),
  recipient_phone: z
    .string()
    .regex(/^010-?\d{4}-?\d{4}$/, "올바른 휴대폰 번호 형식이 아닙니다"),
  recipient_email: z
    .string()
    .email("올바른 이메일 형식이 아닙니다")
    .optional()
    .or(z.literal("")),
  shipping_zipcode: z.string().trim().min(1, "우편번호를 입력해주세요"),
  shipping_address: z.string().trim().min(1, "기본 주소를 입력해주세요"),
  shipping_address_detail: z.string().nullable().optional(),
  shipping_memo: z.string().nullable().optional(),
  depositor_name: z.string().trim().min(1, "입금자명을 입력해주세요"),
  items: z
    .array(orderItemInputSchema)
    .min(1, "주문할 상품이 없습니다"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

type ActionResult =
  | { ok: true; orderNumber: string; phoneLast4: string }
  | { ok: false; error: string };

interface ProductOptionValue {
  label: string;
  price_delta: number;
}

interface ProductOption {
  name: string;
  values: ProductOptionValue[];
}

// 상품 옵션 jsonb 에서 선택값에 해당하는 가산금을 합산.
function computeUnitPrice(
  basePrice: number,
  options: ProductOption[],
  selected: Record<string, string>,
): number {
  let price = basePrice;
  for (const [groupName, label] of Object.entries(selected)) {
    const group = options.find((g) => g.name === groupName);
    if (!group) continue;
    const value = group.values.find((v) => v.label === label);
    if (value) price += value.price_delta;
  }
  return price;
}

export async function createOrderAction(
  rawInput: unknown,
): Promise<ActionResult> {
  // ─ 1) 입력 검증
  const parsed = createOrderSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0].message };
  }
  const data = parsed.data;

  const supabase = await createClient();

  // ─ 2) 상품 정보 일괄 조회 (가격 재계산·스냅샷 데이터 확보)
  const productIds = Array.from(
    new Set(data.items.map((i) => i.product_id)),
  );
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select(
      "id, slug, name, base_price, thumbnail_url, options, category_id, is_active",
    )
    .in("id", productIds);
  if (productsError) {
    console.error("createOrder products fetch:", productsError);
    return { ok: false, error: "상품 정보를 불러오지 못했습니다." };
  }
  if (!products || products.length !== productIds.length) {
    return { ok: false, error: "주문 상품 중 일부를 찾을 수 없습니다." };
  }
  const inactive = products.find((p) => !p.is_active);
  if (inactive) {
    return {
      ok: false,
      error: `판매 중지된 상품이 포함되어 있습니다 (${inactive.name}).`,
    };
  }

  // ─ 3) 서버 단 가격 계산
  const itemRows = data.items.map((item) => {
    const product = products.find((p) => p.id === item.product_id);
    if (!product) {
      throw new Error("UNREACHABLE: product missing after pre-check");
    }
    const opts = (product.options as unknown as ProductOption[]) ?? [];
    const unitPrice = computeUnitPrice(
      product.base_price,
      opts,
      item.selected_options,
    );
    const subtotal = unitPrice * item.quantity;
    return {
      product_id: product.id,
      category_id: product.category_id,
      product_slug: product.slug,
      product_name: product.name,
      thumbnail_url: product.thumbnail_url,
      unit_price: unitPrice,
      quantity: item.quantity,
      selected_options: item.selected_options,
      custom_data: item.custom_data ?? null,
      subtotal,
    };
  });

  const productTotal = itemRows.reduce((sum, r) => sum + r.subtotal, 0);
  const totalAmount = productTotal + SHIPPING_FEE;

  // ─ 4) 주문번호 생성 (PG 함수, KST 기준 일자 시퀀스)
  const { data: orderNumberRes, error: rpcError } = await supabase.rpc(
    "generate_order_number",
  );
  if (rpcError || typeof orderNumberRes !== "string") {
    console.error("generate_order_number:", rpcError);
    return { ok: false, error: "주문번호 생성에 실패했습니다." };
  }
  const orderNumber = orderNumberRes;

  // ─ 5) 휴대폰 끝 4자리 추출
  const phoneDigits = data.recipient_phone.replace(/-/g, "");
  const phoneLast4 = phoneDigits.slice(-4);

  // ─ 6) orders INSERT
  const recipientEmail =
    data.recipient_email && data.recipient_email.trim().length > 0
      ? data.recipient_email.trim()
      : null;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      status: "pending_payment",
      total_amount: totalAmount,
      shipping_fee: SHIPPING_FEE,
      recipient_name: data.recipient_name,
      recipient_phone: data.recipient_phone,
      recipient_email: recipientEmail,
      phone_last4: phoneLast4,
      shipping_address: data.shipping_address,
      shipping_address_detail: data.shipping_address_detail || null,
      shipping_zipcode: data.shipping_zipcode,
      shipping_memo: data.shipping_memo || null,
      depositor_name: data.depositor_name,
    })
    .select("id")
    .single();
  if (orderError || !order) {
    console.error("createOrder insert order:", orderError);
    return { ok: false, error: "주문 생성에 실패했습니다." };
  }

  // ─ 7) order_items 다건 INSERT
  const itemsPayload = itemRows.map((row) => ({ ...row, order_id: order.id }));
  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(itemsPayload);
  if (itemsError) {
    console.error("createOrder insert items:", itemsError);
    // 보상: orders 행 제거 (트랜잭션 대용)
    await supabase.from("orders").delete().eq("id", order.id);
    return { ok: false, error: "주문 항목 저장에 실패했습니다." };
  }

  // ─ 8) deposits INSERT
  const { error: depositError } = await supabase.from("deposits").insert({
    order_id: order.id,
    expected_amount: totalAmount,
    confirmed: false,
  });
  if (depositError) {
    console.error("createOrder insert deposit:", depositError);
    await supabase.from("order_items").delete().eq("order_id", order.id);
    await supabase.from("orders").delete().eq("id", order.id);
    return { ok: false, error: "입금 정보 저장에 실패했습니다." };
  }

  // ─ 9) 주문 접수 메일 (이메일 입력했을 때만, 실패해도 주문은 성공)
  if (recipientEmail) {
    const tpl = orderCreatedEmail({
      orderNumber,
      recipientName: data.recipient_name,
      totalAmount,
      depositorName: data.depositor_name,
      items: itemRows.map((r) => ({
        product_name: r.product_name,
        quantity: r.quantity,
        subtotal: r.subtotal,
      })),
    });
    await sendEmail({ to: recipientEmail, ...tpl });
  }

  return { ok: true, orderNumber, phoneLast4 };
}
