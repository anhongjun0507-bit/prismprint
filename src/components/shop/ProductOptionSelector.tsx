"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { formatPrice } from "@/lib/utils";

import type { ProductOption } from "@/types";

interface ProductOptionSelectorProps {
  options: ProductOption[];
  selected: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
}

export function ProductOptionSelector({
  options,
  selected,
  onChange,
}: ProductOptionSelectorProps) {
  if (options.length === 0) return null;

  function handleSelect(optionName: string, value: string) {
    onChange({ ...selected, [optionName]: value });
  }

  return (
    <div className="space-y-3">
      {options.map((option) => {
        const value = selected[option.name] ?? "";
        return (
          <div key={option.id} className="space-y-1.5">
            <Label htmlFor={`option-${option.id}`} className="text-sm">
              {option.name}
              {option.is_required && (
                <span className="ml-1 text-primary">*</span>
              )}
            </Label>
            <Select
              value={value}
              onValueChange={(v) => handleSelect(option.name, v)}
            >
              <SelectTrigger id={`option-${option.id}`}>
                <SelectValue placeholder={`${option.name}을(를) 선택하세요`} />
              </SelectTrigger>
              <SelectContent>
                {option.values.map((v) => (
                  <SelectItem key={v.label} value={v.label}>
                    {v.label}
                    {v.price_delta > 0
                      ? ` (+${formatPrice(v.price_delta)})`
                      : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      })}
    </div>
  );
}
