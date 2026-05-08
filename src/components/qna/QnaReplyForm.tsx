"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createReplyAction } from "@/app/(shop)/qna/actions";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface QnaReplyFormProps {
  postId: string;
}

export function QnaReplyForm({ postId }: QnaReplyFormProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        const res = await createReplyAction(postId, { content });
        setPending(false);
        if (res.ok) {
          setContent("");
          router.refresh();
        } else {
          setError(res.error);
        }
      }}
      className="space-y-3 rounded-md border bg-muted/30 p-4"
    >
      <Label htmlFor="qna-reply-content" className="text-sm font-semibold">
        관리자 답변 작성
      </Label>
      <Textarea
        id="qna-reply-content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={5}
        placeholder="답변 내용을 입력해주세요."
        required
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "등록 중..." : "답변 등록"}
        </Button>
      </div>
    </form>
  );
}
