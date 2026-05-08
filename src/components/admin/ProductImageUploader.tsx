"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";

import {
  deleteProductImageAction,
  uploadProductImageAction,
} from "@/app/admin/(protected)/products/actions";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

interface ProductImageUploaderProps {
  value: string | null;
  onChange: (url: string | null) => void;
  productSlug: string;
  className?: string;
}

export function ProductImageUploader({
  value,
  onChange,
  productSlug,
  className,
}: ProductImageUploaderProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function handleFile(file: File) {
    setPending(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("slug", productSlug);
    const res = await uploadProductImageAction(fd);
    setPending(false);
    if (res.ok) {
      onChange(res.url);
    } else {
      setError(res.error);
    }
  }

  async function handleRemove() {
    if (!value) return;
    setPending(true);
    // Storage 삭제는 best-effort. 실패해도 폼 값은 비운다.
    await deleteProductImageAction(value);
    onChange(null);
    setPending(false);
  }

  return (
    <div className={cn("space-y-2", className)}>
      {value ? (
        <div className="relative inline-block">
          <Image
            src={value}
            alt="이미지 미리보기"
            width={160}
            height={160}
            className="h-40 w-40 rounded-md border object-cover"
            unoptimized
          />
          <button
            type="button"
            aria-label="이미지 삭제"
            onClick={handleRemove}
            disabled={pending}
            className="absolute right-1 top-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow hover:opacity-90 disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={pending}
          className="flex h-40 w-40 flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed bg-muted/30 text-xs text-muted-foreground hover:bg-muted/50 disabled:opacity-50"
        >
          <Upload className="h-5 w-5" />
          {pending ? "업로드 중..." : "이미지 선택"}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      <p className="text-xs text-muted-foreground">
        JPEG·PNG·WebP, 5MB 이하
      </p>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
