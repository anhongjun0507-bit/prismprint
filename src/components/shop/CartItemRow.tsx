"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { QuantitySelector } from "@/components/shop/QuantitySelector";

import { getCategoryGradient } from "@/lib/categoryStyles";
import { useCartStore } from "@/lib/stores/cart-store";
import { cn, formatPrice } from "@/lib/utils";

import type { CartItem } from "@/types";

interface CartItemRowProps {
  item: CartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const optionsSummary = Object.values(item.selected_options).join(" · ");
  const recipientName = pickRecipientName(item.custom_data);

  return (
    <li className="flex flex-col gap-3 rounded-md border bg-white p-3 sm:flex-row sm:items-stretch sm:gap-4 sm:p-4">
      <div
        className={cn(
          "relative aspect-square w-full shrink-0 overflow-hidden rounded-md bg-gradient-to-br sm:w-24",
          getCategoryGradient(item.category_id),
        )}
      >
        {item.thumbnail_url && (
          <Image
            src={item.thumbnail_url}
            alt={item.product_name}
            fill
            sizes="96px"
            className="object-cover"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between gap-3">
        <div>
          <Link
            href={`/products/${item.product_slug}`}
            className="font-medium hover:underline"
          >
            {item.product_name}
          </Link>
          {optionsSummary && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {optionsSummary}
            </p>
          )}
          {recipientName && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              받는 분: {recipientName}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <QuantitySelector
            value={item.quantity}
            onChange={(q) => updateQuantity(item.id, q)}
          />
          <div className="text-right">
            <p className="text-base font-bold">{formatPrice(item.subtotal)}</p>
            <p className="text-xs text-muted-foreground">
              단가 {formatPrice(item.unit_price)}
            </p>
          </div>
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => removeItem(item.id)}
        aria-label="삭제"
        className="self-start text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </li>
  );
}

function pickRecipientName(
  customData: Record<string, unknown> | null,
): string | null {
  if (!customData) return null;
  const value = customData["recipient_name"];
  return typeof value === "string" && value.length > 0 ? value : null;
}
