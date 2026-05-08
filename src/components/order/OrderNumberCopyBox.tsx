"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface OrderNumberCopyBoxProps {
  orderNumber: string;
}

export function OrderNumberCopyBox({ orderNumber }: OrderNumberCopyBoxProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      toast.success("주문번호가 복사되었습니다");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("복사에 실패했습니다");
    }
  }

  return (
    <div className="mt-4 inline-flex items-center gap-2 rounded-md border bg-muted/30 px-4 py-2">
      <span className="text-xs text-muted-foreground">주문번호</span>
      <span className="font-mono text-sm font-bold sm:text-base">
        {orderNumber}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleCopy}
        aria-label="주문번호 복사"
        className="h-7 px-2"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  );
}
