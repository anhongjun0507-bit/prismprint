"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createReplyAction } from "@/app/(shop)/qna/actions";
import { updateQnaReplyAction } from "@/app/admin/(protected)/board/actions";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface AdminQnaReplyFormProps {
  postId: string;
  // 있으면 수정 모드, 없으면 새 답변 작성 모드.
  replyId?: string;
  defaultContent?: string;
  onCancel?: () => void;
  onDone?: () => void;
}

export function AdminQnaReplyForm({
  postId,
  replyId,
  defaultContent = "",
  onCancel,
  onDone,
}: AdminQnaReplyFormProps) {
  const router = useRouter();
  const [content, setContent] = useState(defaultContent);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const isEdit = Boolean(replyId);

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        const trimmed = content.trim();
        const res = isEdit && replyId
          ? await updateQnaReplyAction(replyId, trimmed)
          : await createReplyAction(postId, { content: trimmed });
        setPending(false);
        if (res.ok) {
          if (!isEdit) setContent("");
          onDone?.();
          router.refresh();
        } else {
          setError(res.error);
        }
      }}
      className="space-y-2"
    >
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={isEdit ? 4 : 5}
        placeholder="답변 내용을 입력해주세요."
        required
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={pending}
          >
            취소
          </Button>
        )}
        <Button type="submit" size="sm" disabled={pending}>
          {pending
            ? isEdit
              ? "수정 중..."
              : "등록 중..."
            : isEdit
              ? "수정"
              : "답변 등록"}
        </Button>
      </div>
    </form>
  );
}
