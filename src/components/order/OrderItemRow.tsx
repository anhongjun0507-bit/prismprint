import Image from "next/image";
import Link from "next/link";

import { getCategoryGradient } from "@/lib/categoryStyles";
import { cn, formatPrice } from "@/lib/utils";

import type { OrderItem } from "@/types";

interface OrderItemRowProps {
  item: OrderItem;
}

export function OrderItemRow({ item }: OrderItemRowProps) {
  const optionsSummary = Object.values(item.selected_options).join(" · ");
  const recipientName = pickRecipientName(item.custom_data);

  return (
    <li className="flex gap-3 py-3 first:pt-0 last:pb-0 sm:gap-4">
      <div
        className={cn(
          "relative aspect-square w-16 shrink-0 overflow-hidden rounded-md bg-gradient-to-br sm:w-20",
          getCategoryGradient(item.category_id),
        )}
      >
        {item.thumbnail_url && (
          <Image
            src={item.thumbnail_url}
            alt={item.product_name}
            fill
            sizes="(min-width: 640px) 80px, 64px"
            className="object-cover"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between gap-1">
        <div>
          <Link
            href={`/products/${item.product_slug}`}
            className="text-sm font-medium hover:underline sm:text-base"
          >
            {item.product_name}
          </Link>
          {optionsSummary && (
            <p className="text-xs text-muted-foreground">
              {optionsSummary}
            </p>
          )}
          {recipientName && (
            <p className="text-xs text-muted-foreground">
              받는 분: {recipientName}
            </p>
          )}
        </div>
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-muted-foreground">
            수량 {item.quantity}
          </span>
          <span className="font-semibold text-foreground">
            {formatPrice(item.subtotal)}
          </span>
        </div>
      </div>
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
