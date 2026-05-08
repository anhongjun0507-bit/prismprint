"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { cn } from "@/lib/utils";
import {
  businessCardCustomDataSchema,
  type BusinessCardCustomData,
} from "@/lib/validations/businessCard";

interface CustomDataFormProps {
  onValidDataChange: (data: BusinessCardCustomData | null) => void;
}

interface FieldDef {
  key: keyof BusinessCardCustomData;
  label: string;
  placeholder: string;
  type?: string;
  autoComplete?: string;
}

const FIELDS: ReadonlyArray<FieldDef> = [
  {
    key: "recipient_name",
    label: "성명",
    placeholder: "홍길동",
    autoComplete: "name",
  },
  { key: "position", label: "직책", placeholder: "팀장" },
  { key: "department", label: "부서", placeholder: "마케팅팀" },
  {
    key: "phone",
    label: "휴대폰",
    placeholder: "010-1234-5678",
    type: "tel",
    autoComplete: "tel",
  },
  {
    key: "email",
    label: "이메일",
    placeholder: "name@company.com",
    type: "email",
    autoComplete: "email",
  },
];

export function CustomDataForm({ onValidDataChange }: CustomDataFormProps) {
  const form = useForm<BusinessCardCustomData>({
    resolver: zodResolver(businessCardCustomDataSchema),
    mode: "onChange",
    defaultValues: {
      recipient_name: "",
      position: "",
      department: "",
      phone: "",
      email: "",
    },
  });

  // 개별 필드 watch — 객체 단위 watch는 매 렌더 새 ref라 useEffect dep가 망가짐
  const recipient_name = form.watch("recipient_name");
  const position = form.watch("position");
  const department = form.watch("department");
  const phone = form.watch("phone");
  const email = form.watch("email");
  const isValid = form.formState.isValid;

  useEffect(() => {
    if (isValid) {
      onValidDataChange({
        recipient_name,
        position,
        department,
        phone,
        email,
      });
    } else {
      onValidDataChange(null);
    }
  }, [
    recipient_name,
    position,
    department,
    phone,
    email,
    isValid,
    onValidDataChange,
  ]);

  return (
    <div className="space-y-3">
      {FIELDS.map(({ key, label, placeholder, type, autoComplete }) => {
        const error = form.formState.errors[key];
        return (
          <div key={key} className="space-y-1.5">
            <Label htmlFor={`bc-${key}`} className="text-sm">
              {label}
              <span className="ml-1 text-primary">*</span>
            </Label>
            <Input
              id={`bc-${key}`}
              type={type ?? "text"}
              placeholder={placeholder}
              autoComplete={autoComplete}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `bc-${key}-error` : undefined}
              className={cn(
                error &&
                  "border-destructive focus-visible:ring-destructive",
              )}
              {...form.register(key)}
            />
            {error && (
              <p
                id={`bc-${key}-error`}
                className="text-xs text-destructive"
              >
                {error.message}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
