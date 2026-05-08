"use client";

import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { useCartStore } from "@/lib/stores/cart-store";

import type { Product } from "@/types";

interface AddToCartButtonProps {
  product: Product;
  selectedOptions: Record<string, string>;
  customData: Record<string, unknown> | null;
  quantity: number;
  unitPrice: number;
  disabled: boolean;
}

export function AddToCartButton({
  product,
  selectedOptions,
  customData,
  quantity,
  unitPrice,
  disabled,
}: AddToCartButtonProps) {
  const router = useRouter();

  function handleClick() {
    useCartStore.getState().addItem({
      product_id: product.id,
      product_slug: product.slug,
      category_id: product.category_id,
      product_name: product.name,
      thumbnail_url: product.thumbnail_url,
      unit_price: unitPrice,
      quantity,
      selected_options: selectedOptions,
      custom_data: customData,
    });

    const totalQuantity = useCartStore.getState().getTotalQuantity();
    toast.success(`장바구니에 담겼습니다 (총 ${totalQuantity}개)`, {
      action: {
        label: "장바구니 보기",
        onClick: () => router.push("/cart"),
      },
    });
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      size="lg"
      className="w-full"
    >
      <ShoppingCart className="mr-2 h-5 w-5" />
      장바구니 담기
    </Button>
  );
}
