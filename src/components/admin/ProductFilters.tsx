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

import type { Category } from "@/types";

interface ProductFiltersProps {
  categories: Category[];
  categoryId: string;
  isActive: string;
  query: string;
}

export function ProductFilters({
  categories,
  categoryId,
  isActive,
  query,
}: ProductFiltersProps) {
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
      router.push(`/admin/products?${params.toString()}`);
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        pushWith({ q: searchInput.trim() || undefined });
      }}
      className="flex flex-col gap-2 sm:flex-row sm:items-center"
    >
      <Select
        value={categoryId || "all"}
        onValueChange={(v) =>
          pushWith({ categoryId: v === "all" ? undefined : v })
        }
      >
        <SelectTrigger className="sm:w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체 카테고리</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={isActive || "all"}
        onValueChange={(v) =>
          pushWith({ isActive: v === "all" ? undefined : v })
        }
      >
        <SelectTrigger className="sm:w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체</SelectItem>
          <SelectItem value="true">활성</SelectItem>
          <SelectItem value="false">비활성</SelectItem>
        </SelectContent>
      </Select>

      <Input
        type="search"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="상품명·슬러그 검색"
        className="sm:max-w-xs"
      />
      <Button type="submit" variant="outline" disabled={pending}>
        검색
      </Button>
      {(query || categoryId !== "all" || isActive !== "all") && (
        <Button
          type="button"
          variant="ghost"
          disabled={pending}
          onClick={() => {
            setSearchInput("");
            startTransition(() => router.push("/admin/products"));
          }}
        >
          초기화
        </Button>
      )}
    </form>
  );
}
