"use client";

import { useCallback, useMemo, useState } from "react";

import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { CustomDataForm } from "@/components/shop/CustomDataForm";
import { ProductOptionSelector } from "@/components/shop/ProductOptionSelector";
import { QuantitySelector } from "@/components/shop/QuantitySelector";

import { formatPrice } from "@/lib/utils";

import type { BusinessCardCustomData } from "@/lib/validations/businessCard";
import type { Product } from "@/types";

interface ProductDetailClientProps {
  product: Product;
  requiresCustomData: boolean;
}

export function ProductDetailClient({
  product,
  requiresCustomData,
}: ProductDetailClientProps) {
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [customData, setCustomData] =
    useState<BusinessCardCustomData | null>(null);
  const [quantity, setQuantity] = useState(1);

  const allRequiredOptionsPicked = product.options.every(
    (opt) => !opt.is_required || Boolean(selectedOptions[opt.name]),
  );

  const customDataReady = !requiresCustomData || customData !== null;
  const ready = allRequiredOptionsPicked && customDataReady && quantity >= 1;

  const unitPrice = useMemo(() => {
    let price = product.base_price;
    for (const opt of product.options) {
      const picked = selectedOptions[opt.name];
      if (!picked) continue;
      const value = opt.values.find((v) => v.label === picked);
      if (value) price += value.price_delta;
    }
    return price;
  }, [product, selectedOptions]);

  const totalPrice = unitPrice * quantity;

  const handleCustomDataChange = useCallback(
    (data: BusinessCardCustomData | null) => {
      setCustomData(data);
    },
    [],
  );

  return (
    <div className="space-y-5">
      {product.options.length > 0 && (
        <section className="space-y-3 rounded-md border bg-muted/30 p-4">
          <h2 className="text-sm font-semibold">옵션 선택</h2>
          <ProductOptionSelector
            options={product.options}
            selected={selectedOptions}
            onChange={setSelectedOptions}
          />
        </section>
      )}

      {requiresCustomData && (
        <section className="space-y-3 rounded-md border bg-muted/30 p-4">
          <div>
            <h2 className="text-sm font-semibold">받는 사람 정보</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              명함에 인쇄될 정보를 입력해주세요. 모든 항목 필수입니다.
            </p>
          </div>
          <CustomDataForm onValidDataChange={handleCustomDataChange} />
        </section>
      )}

      <section className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium">수량</span>
        <QuantitySelector value={quantity} onChange={setQuantity} />
      </section>

      <div className="flex items-center justify-between rounded-md border bg-background px-4 py-3">
        <span className="text-sm text-muted-foreground">결제 금액</span>
        <span className="text-xl font-bold">{formatPrice(totalPrice)}</span>
      </div>

      <AddToCartButton
        product={product}
        selectedOptions={selectedOptions}
        customData={customData}
        quantity={quantity}
        unitPrice={unitPrice}
        disabled={!ready}
      />
    </div>
  );
}
