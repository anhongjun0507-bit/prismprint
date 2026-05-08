"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { deleteQnaPostAction } from "@/app/(shop)/qna/actions";

import { Button } from "@/components/ui/button";

interface QnaPostDeleteButtonProps {
  postId: string;
}

// admin 인 상태에서 비밀번호 없이 즉시 삭제. shop 의 deleteQnaPostAction 이
// auth.getUser() 를 보고 admin 분기로 처리한다.
export function QnaPostDeleteButton({ postId }: QnaPostDeleteButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirm("이 글과 답변을 모두 삭제할까요?")) return;
    setPending(true);
    setError(null);
    const res = await deleteQnaPostAction(postId, null);
    setPending(false);
    if (res.ok) {
      router.push("/admin/board?tab=qna");
      router.refresh();
    } else {
      setError(res.error);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleDelete}
        disabled={pending}
        className="text-destructive hover:bg-destructive/5 hover:text-destructive"
      >
        <Trash2 className="mr-1 h-3.5 w-3.5" />
        {pending ? "삭제 중..." : "글 삭제"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
