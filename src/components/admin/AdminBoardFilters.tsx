"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdminBoardFiltersProps {
  tab: "qna" | "reviews";
  // Q&A
  isAnswered?: string;
  query?: string;
  // Reviews
  isVisible?: string;
  ratingMin?: string;
}

export function AdminBoardFilters({
  tab,
  isAnswered = "all",
  query = "",
  isVisible = "all",
  ratingMin = "1",
}: AdminBoardFiltersProps) {
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
    params.delete("page");
    startTransition(() => {
      router.push(`/admin/board?${params.toString()}`);
    });
  }

  if (tab === "qna") {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          pushWith({ q: searchInput.trim() || undefined });
        }}
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
      >
        <Select
          value={isAnswered}
          onValueChange={(v) =>
            pushWith({ isAnswered: v === "all" ? undefined : v })
          }
        >
          <SelectTrigger className="sm:w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="false">미답변</SelectItem>
            <SelectItem value="true">답변완료</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="제목·작성자 검색"
          className="sm:max-w-xs"
        />
        <Button type="submit" variant="outline" disabled={pending}>
          검색
        </Button>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Select
        value={isVisible}
        onValueChange={(v) =>
          pushWith({ isVisible: v === "all" ? undefined : v })
        }
      >
        <SelectTrigger className="sm:w-[160px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체</SelectItem>
          <SelectItem value="true">노출</SelectItem>
          <SelectItem value="false">숨김</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={ratingMin}
        onValueChange={(v) => pushWith({ ratingMin: v === "1" ? undefined : v })}
      >
        <SelectTrigger className="sm:w-[160px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">평점 전체</SelectItem>
          <SelectItem value="2">2점 이상</SelectItem>
          <SelectItem value="3">3점 이상</SelectItem>
          <SelectItem value="4">4점 이상</SelectItem>
          <SelectItem value="5">5점만</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
