"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import {
  calculateDepositDeadline,
  formatDeadline,
  formatPrice,
} from "@/lib/utils";

interface DepositInfoBoxProps {
  bankName: string;
  accountNumber: string;
  holder: string;
  amount: number;
  depositorName: string;
  createdAt: string;
}

export function DepositInfoBox({
  bankName,
  accountNumber,
  holder,
  amount,
  depositorName,
  createdAt,
}: DepositInfoBoxProps) {
  const [copied, setCopied] = useState(false);

  const deadline = calculateDepositDeadline(createdAt);
  const deadlineText = formatDeadline(deadline);

  async function handleCopyAccount() {
    try {
      // 은행 앱이 dash를 포함하지 않은 숫자만 받는 경우가 많아 제거 후 복사.
      await navigator.clipboard.writeText(accountNumber.replace(/-/g, ""));
      setCopied(true);
      toast.success("계좌번호가 복사되었습니다");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("복사에 실패했습니다");
    }
  }

  return (
    <section
      aria-label="무통장입금 안내"
      className="rounded-md border-2 border-primary/30 bg-primary/5 p-5 sm:p-6"
    >
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold sm:text-lg">
            무통장입금 안내
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            아래 계좌로 입금 후 입금자명을 확인해주세요.
          </p>
        </div>

        <dl className="space-y-2 text-sm">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-primary/10 pb-2">
            <dt className="text-muted-foreground">은행</dt>
            <dd className="font-semibold">{bankName}</dd>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-primary/10 pb-2">
            <dt className="text-muted-foreground">계좌번호</dt>
            <dd className="flex items-center gap-2">
              <span className="font-mono font-semibold">
                {accountNumber}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyAccount}
                aria-label="계좌번호 복사"
                className="h-7 px-2"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                <span className="ml-1 text-xs">
                  {copied ? "복사됨" : "복사"}
                </span>
              </Button>
            </dd>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-primary/10 pb-2">
            <dt className="text-muted-foreground">예금주</dt>
            <dd className="font-semibold">{holder}</dd>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-primary/10 pb-2">
            <dt className="text-muted-foreground">입금자명</dt>
            <dd className="font-semibold">{depositorName}</dd>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-2 pt-1">
            <dt className="text-muted-foreground">입금 금액</dt>
            <dd className="text-lg font-bold text-primary sm:text-xl">
              {formatPrice(amount)}
            </dd>
          </div>
        </dl>

        <div className="rounded-md bg-background px-4 py-3 text-sm">
          <p className="font-semibold">입금 기한</p>
          <p className="mt-1 text-muted-foreground">
            <span className="font-semibold text-foreground">
              {deadlineText}
            </span>{" "}
            입금하지 않으면 자동 취소됩니다.
          </p>
        </div>
      </div>
    </section>
  );
}
