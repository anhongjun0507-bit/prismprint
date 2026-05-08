"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type {
  AdminOrderStats,
  AdminOrderStatus,
} from "@/lib/supabase/queries/admin-orders";

interface OrderFiltersProps {
  status: AdminOrderStatus | "all";
  query: string;
  range: string;
  stats: AdminOrderStats;
}

const STATUS_TABS: Array<{
  value: AdminOrderStatus | "all";
  label: string;
}> = [
  { value: "all", label: "전체" },
  { value: "pending_payment", label: "입금 대기" },
  { value: "paid", label: "입금 확인" },
  { value: "preparing", label: "제작 중" },
  { value: "shipping", label: "배송 중" },
  { value: "delivered", label: "배송 완료" },
  { value: "cancelled", label: "취소" },
];

const RANGE_OPTIONS = [
  { value: "all", label: "전체 기간" },
  { value: "today", label: "오늘" },
  { value: "7d", label: "최근 7일" },
  { value: "30d", label: "최근 30일" },
];

export function OrderFilters({
  status,
  query,
  range,
  stats,
}: OrderFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(query);

  function pushWith(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === undefined || v === "" || v === "all") params.delete(k);
      else params.set(k, v);
    }
    // 필터 변경 시 페이지 1 로 리셋.
    params.delete("page");
    startTransition(() => {
      router.push(`/admin/orders?${params.toString()}`);
    });
  }

  return (
    <div className="space-y-3">
      <nav
        aria-label="주문 상태 필터"
        className="flex flex-wrap gap-1.5 border-b pb-3"
      >
        {STATUS_TABS.map((tab) => {
          const active = status === tab.value;
          const count = stats[tab.value] ?? 0;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() =>
                pushWith({ status: tab.value === "all" ? undefined : tab.value })
              }
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background hover:bg-muted",
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "tabular-nums text-xs",
                  active
                    ? "text-primary-foreground/80"
                    : "text-muted-foreground",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </nav>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          pushWith({ q: searchInput.trim() || undefined });
        }}
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
      >
        <Input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="주문번호·받는사람·휴대폰 검색"
          className="sm:max-w-xs"
        />
        <Select
          value={range}
          onValueChange={(v) => pushWith({ range: v === "all" ? undefined : v })}
        >
          <SelectTrigger className="sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANGE_OPTIONS.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" variant="outline" disabled={pending}>
          검색
        </Button>
        {(query || status !== "all" || range !== "all") && (
          <Button
            type="button"
            variant="ghost"
            disabled={pending}
            onClick={() => {
              setSearchInput("");
              startTransition(() => router.push("/admin/orders"));
            }}
          >
            초기화
          </Button>
        )}
      </form>
    </div>
  );
}
