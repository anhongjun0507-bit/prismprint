"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/client";
import {
  depositConfirmedEmail,
  shippingStartedEmail,
} from "@/lib/email/templates";

type ActionResult = { ok: true } | { ok: false; error: string };

// admin 만 통과시키는 헬퍼. RLS 가 1차 차단하지만 명시적 가드.
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

function revalidateOrderPaths(orderId: string) {
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

// 입금 확인: deposits.confirmed=true + orders.status=paid + paid_at=now()
export async function confirmDepositAction(
  orderId: string,
  memo?: string,
): Promise<ActionResult> {
  const { supabase, user } = await requireAdmin();
  if (!user) return { ok: false, error: "권한이 없습니다." };

  const now = new Date().toISOString();

  const depositUpdate: Record<string, unknown> = {
    confirmed: true,
    confirmed_at: now,
    confirmed_by: user.id,
  };
  if (memo && memo.trim().length > 0) depositUpdate.memo = memo.trim();

  const { error: depError } = await supabase
    .from("deposits")
    .update(depositUpdate)
    .eq("order_id", orderId);
  if (depError) {
    console.error("confirmDeposit deposits update failed:", depError);
    return { ok: false, error: "입금 확인 처리에 실패했습니다." };
  }

  const { error: ordError } = await supabase
    .from("orders")
    .update({ status: "paid", paid_at: now })
    .eq("id", orderId)
    .eq("status", "pending_payment");
  if (ordError) {
    console.error("confirmDeposit orders update failed:", ordError);
    return { ok: false, error: "주문 상태 변경에 실패했습니다." };
  }

  // 입금 확인 메일 (이메일 있을 때만, 실패해도 상태 변경은 성공)
  const { data: orderInfo } = await supabase
    .from("orders")
    .select("order_number, recipient_name, recipient_email")
    .eq("id", orderId)
    .maybeSingle();
  if (orderInfo?.recipient_email) {
    const tpl = depositConfirmedEmail({
      orderNumber: orderInfo.order_number,
      recipientName: orderInfo.recipient_name,
    });
    await sendEmail({ to: orderInfo.recipient_email, ...tpl });
  }

  revalidateOrderPaths(orderId);
  return { ok: true };
}

// 허용된 상태 전이만 통과시킨다.
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending_payment: ["cancelled"],
  paid: ["preparing", "cancelled"],
  preparing: ["shipping", "cancelled"],
  shipping: ["delivered"],
};

export async function updateOrderStatusAction(
  orderId: string,
  newStatus: "preparing" | "shipping" | "delivered" | "cancelled",
  trackingNumber?: string,
): Promise<ActionResult> {
  const { supabase, user } = await requireAdmin();
  if (!user) return { ok: false, error: "권한이 없습니다." };

  const { data: order } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return { ok: false, error: "주문을 찾을 수 없습니다." };

  const allowed = ALLOWED_TRANSITIONS[order.status] ?? [];
  if (!allowed.includes(newStatus)) {
    return {
      ok: false,
      error: `현재 상태에서 해당 동작을 진행할 수 없습니다.`,
    };
  }

  const now = new Date().toISOString();
  const update: Record<string, unknown> = { status: newStatus };
  if (newStatus === "shipping") {
    update.shipped_at = now;
    if (trackingNumber && trackingNumber.trim().length > 0) {
      update.tracking_number = trackingNumber.trim();
    }
  } else if (newStatus === "delivered") {
    update.delivered_at = now;
  } else if (newStatus === "cancelled") {
    update.cancelled_at = now;
  }

  const { error } = await supabase
    .from("orders")
    .update(update)
    .eq("id", orderId);
  if (error) {
    console.error("updateOrderStatus failed:", error);
    return { ok: false, error: "상태 변경에 실패했습니다." };
  }

  // shipping 으로 전이 시 배송 시작 메일 (이메일 있을 때만)
  if (newStatus === "shipping") {
    const { data: orderInfo } = await supabase
      .from("orders")
      .select("order_number, recipient_name, recipient_email, tracking_number")
      .eq("id", orderId)
      .maybeSingle();
    if (orderInfo?.recipient_email) {
      const tpl = shippingStartedEmail({
        orderNumber: orderInfo.order_number,
        recipientName: orderInfo.recipient_name,
        trackingNumber: orderInfo.tracking_number,
      });
      await sendEmail({ to: orderInfo.recipient_email, ...tpl });
    }
  }

  revalidateOrderPaths(orderId);
  return { ok: true };
}

export async function cancelOrderAction(
  orderId: string,
): Promise<ActionResult> {
  const { supabase, user } = await requireAdmin();
  if (!user) return { ok: false, error: "권한이 없습니다." };

  const { data: order } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return { ok: false, error: "주문을 찾을 수 없습니다." };
  if (order.status === "delivered" || order.status === "cancelled") {
    return { ok: false, error: "이미 종료된 주문은 취소할 수 없습니다." };
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("orders")
    .update({ status: "cancelled", cancelled_at: now })
    .eq("id", orderId);
  if (error) {
    console.error("cancelOrder failed:", error);
    return { ok: false, error: "주문 취소에 실패했습니다." };
  }

  revalidateOrderPaths(orderId);
  return { ok: true };
}
