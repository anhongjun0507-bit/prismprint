"use client";

import { Plus, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { ProductOptionInput } from "@/lib/validations/product";

interface ProductOptionsEditorProps {
  value: ProductOptionInput[];
  onChange: (next: ProductOptionInput[]) => void;
}

export function ProductOptionsEditor({
  value,
  onChange,
}: ProductOptionsEditorProps) {
  function addGroup() {
    onChange([
      ...value,
      {
        name: "",
        values: [{ label: "", price_delta: 0 }],
        is_required: true,
        display_order: value.length + 1,
      },
    ]);
  }

  function removeGroup(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  function patchGroup(idx: number, patch: Partial<ProductOptionInput>) {
    onChange(value.map((g, i) => (i === idx ? { ...g, ...patch } : g)));
  }

  function addValue(gIdx: number) {
    const group = value[gIdx];
    patchGroup(gIdx, {
      values: [...group.values, { label: "", price_delta: 0 }],
    });
  }

  function removeValue(gIdx: number, vIdx: number) {
    const group = value[gIdx];
    patchGroup(gIdx, {
      values: group.values.filter((_, i) => i !== vIdx),
    });
  }

  function patchValue(
    gIdx: number,
    vIdx: number,
    patch: Partial<ProductOptionInput["values"][number]>,
  ) {
    const group = value[gIdx];
    patchGroup(gIdx, {
      values: group.values.map((v, i) => (i === vIdx ? { ...v, ...patch } : v)),
    });
  }

  return (
    <div className="space-y-3">
      {value.length === 0 && (
        <p className="text-xs text-muted-foreground">
          등록된 옵션이 없습니다. 옵션 그룹을 추가해주세요.
        </p>
      )}

      {value.map((group, gIdx) => (
        <div
          key={gIdx}
          className="space-y-3 rounded-md border bg-muted/30 p-3 sm:p-4"
        >
          <div className="flex items-center gap-2">
            <Input
              value={group.name}
              onChange={(e) => patchGroup(gIdx, { name: e.target.value })}
              placeholder="그룹명 (예: 수량)"
              className="flex-1"
            />
            <label className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-input"
                checked={group.is_required}
                onChange={(e) =>
                  patchGroup(gIdx, { is_required: e.target.checked })
                }
              />
              필수
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeGroup(gIdx)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              그룹 삭제
            </Button>
          </div>

          <div className="space-y-1.5 sm:pl-3">
            {group.values.map((v, vIdx) => (
              <div key={vIdx} className="flex items-center gap-1.5">
                <Input
                  value={v.label}
                  onChange={(e) =>
                    patchValue(gIdx, vIdx, { label: e.target.value })
                  }
                  placeholder="값 (예: 200매)"
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={v.price_delta}
                  onChange={(e) =>
                    patchValue(gIdx, vIdx, {
                      price_delta: Number(e.target.value) || 0,
                    })
                  }
                  placeholder="가산 금액"
                  className="w-28"
                />
                <button
                  type="button"
                  aria-label="값 삭제"
                  onClick={() => removeValue(gIdx, vIdx)}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addValue(gIdx)}
            >
              <Plus className="mr-1 h-3.5 w-3.5" />값 추가
            </Button>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" onClick={addGroup}>
        <Plus className="mr-1 h-4 w-4" />
        옵션 그룹 추가
      </Button>
    </div>
  );
}
