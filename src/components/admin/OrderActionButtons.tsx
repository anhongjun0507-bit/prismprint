"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  cancelOrderAction,
  confirmDepositAction,
  updateOrderStatusAction,
} from "@/app/admin/(protected)/orders/actions";
import { formatPrice } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { OrderStatus } from "@/types";

type Mode =
  | "confirm-deposit"
  | "to-preparing"
  | "to-shipping"
  | "to-delivered"
  | "cancel";

interface OrderActionButtonsProps {
  orderId: string;
  status: OrderStatus;
  expectedAmount: number;
  depositorName: string;
}

const DIALOG_TITLE: Record<Mode, string> = {
  "confirm-deposit": "입금을 확인할까요?",
  "to-preparing": "제작을 시작할까요?",
  "to-shipping": "배송을 시작할까요?",
  "to-delivered": "배송 완료로 변경할까요?",
  cancel: "주문을 취소할까요?",
};

export function OrderActionButtons({
  orderId,
  status,
  expectedAmount,
  depositorName,
}: OrderActionButtonsProps) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [memo, setMemo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function close() {
    setMode(null);
    setError(null);
    setTrackingNumber("");
    setMemo("");
  }

  async function handleAction() {
    if (!mode) return;
    setPending(true);
    setError(null);
    let res: { ok: true } | { ok: false; error: string };
    if (mode === "confirm-deposit") {
      res = await confirmDepositAction(orderId, memo || undefined);
    } else if (mode === "to-preparing") {
      res = await updateOrderStatusAction(orderId, "preparing");
    } else if (mode === "to-shipping") {
      const tn = trackingNumber.trim();
      if (!tn) {
        setError("송장번호를 입력해주세요.");
        setPending(false);
        return;
      }
      res = await updateOrderStatusAction(orderId, "shipping", tn);
    } else if (mode === "to-delivered") {
      res = await updateOrderStatusAction(orderId, "delivered");
    } else {
      res = await cancelOrderAction(orderId);
    }
    setPending(false);
    if (res.ok) {
      close();
      router.refresh();
    } else {
      setError(res.error);
    }
  }

  let mainAction: { mode: Mode; label: string } | null = null;
  if (status === "pending_payment") {
    mainAction = { mode: "confirm-deposit", label: "입금 확인" };
  } else if (status === "paid") {
    mainAction = { mode: "to-preparing", label: "제작 시작" };
  } else if (status === "preparing") {
    mainAction = { mode: "to-shipping", label: "배송 시작" };
  } else if (status === "shipping") {
    mainAction = { mode: "to-delivered", label: "배송 완료" };
  }

  const canCancel = status !== "delivered" && status !== "cancelled";

  if (!mainAction && !canCancel) return null;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {mainAction && (
          <Button
            size="lg"
            onClick={() => mainAction && setMode(mainAction.mode)}
          >
            {mainAction.label}
          </Button>
        )}
        {canCancel && (
          <Button
            variant="outline"
            size="lg"
            onClick={() => setMode("cancel")}
          >
            주문 취소
          </Button>
        )}
      </div>

      <Dialog open={mode !== null} onOpenChange={(o) => !o && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{mode ? DIALOG_TITLE[mode] : ""}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            {mode === "confirm-deposit" && (
              <div className="space-y-3">
                <div className="rounded-md border bg-muted/30 p-3 text-sm">
                  <p>
                    예상 입금액:{" "}
                    <strong>{formatPrice(expectedAmount)}</strong>
                  </p>
                  <p>
                    입금자명: <strong>{depositorName}</strong>
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deposit-memo">메모 (선택)</Label>
                  <Input
                    id="deposit-memo"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="예: 18:30 도착 확인"
                  />
                </div>
              </div>
            )}
            {mode === "to-shipping" && (
              <div className="space-y-2">
                <Label htmlFor="tracking-number">송장번호</Label>
                <Input
                  id="tracking-number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="123456789012"
                  autoComplete="off"
                />
              </div>
            )}
            {(mode === "to-preparing" ||
              mode === "to-delivered" ||
              mode === "cancel") && (
              <p className="text-muted-foreground">
                {mode === "cancel"
                  ? "취소된 주문은 되돌릴 수 없습니다."
                  : "진행하면 주문 상태가 즉시 바뀝니다."}
              </p>
            )}
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close} disabled={pending}>
              취소
            </Button>
            <Button
              variant={mode === "cancel" ? "destructive" : "default"}
              onClick={handleAction}
              disabled={pending}
            >
              {pending ? "처리 중..." : "확인"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
