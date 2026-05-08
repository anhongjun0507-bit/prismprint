"use client";

import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

const BUTTON_BASE =
  "inline-flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent";

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
}: QuantitySelectorProps) {
  function clamp(n: number): number {
    return Math.max(min, Math.min(max, Math.floor(n)));
  }

  function dec() {
    onChange(clamp(value - 1));
  }

  function inc() {
    onChange(clamp(value + 1));
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const n = Number(e.target.value);
    if (Number.isFinite(n)) {
      onChange(clamp(n));
    }
  }

  return (
    <div className="inline-flex items-center rounded-md border">
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        aria-label="수량 감소"
        className={cn(BUTTON_BASE, "border-r")}
      >
        <Minus className="h-4 w-4" />
      </button>
      <input
        type="number"
        value={value}
        onChange={handleInput}
        min={min}
        max={max}
        aria-label="수량"
        className="h-10 w-14 border-0 bg-transparent text-center text-base focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={inc}
        disabled={value >= max}
        aria-label="수량 증가"
        className={cn(BUTTON_BASE, "border-l")}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
