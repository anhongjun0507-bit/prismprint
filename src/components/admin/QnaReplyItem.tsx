"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";

import { deleteQnaReplyAction } from "@/app/admin/(protected)/board/actions";
import { formatQnaDate } from "@/lib/qna-format";

import { AdminQnaReplyForm } from "@/components/admin/AdminQnaReplyForm";
import { Button } from "@/components/ui/button";

import type { AdminQnaReply } from "@/lib/supabase/queries/admin-board";

interface QnaReplyItemProps {
  reply: AdminQnaReply;
  postId: string;
}

export function QnaReplyItem({ reply, postId }: QnaReplyItemProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirm("이 답변을 삭제할까요?")) return;
    setDeleting(true);
    setError(null);
    const res = await deleteQnaReplyAction(reply.id);
    setDeleting(false);
    if (res.ok) {
      router.refresh();
    } else {
      setError(res.error);
    }
  }

  if (editing) {
    return (
      <li className="rounded-md border-l-4 border-primary/40 bg-primary/5 p-4">
        <p className="mb-2 text-xs font-semibold text-primary">답변 수정</p>
        <AdminQnaReplyForm
          postId={postId}
          replyId={reply.id}
          defaultContent={reply.content}
          onCancel={() => setEditing(false)}
          onDone={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <li className="rounded-md border-l-4 border-primary/40 bg-primary/5 p-4">
      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-semibold text-primary">관리자 답변</span>
        <time dateTime={reply.created_at}>
          {formatQnaDate(reply.created_at)}
        </time>
      </div>
      <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
        {reply.content}
      </div>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      <div className="mt-3 flex justify-end gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setEditing(true)}
          disabled={deleting}
        >
          <Pencil className="mr-1 h-3.5 w-3.5" />
          수정
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={deleting}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="mr-1 h-3.5 w-3.5" />
          {deleting ? "삭제 중..." : "삭제"}
        </Button>
      </div>
    </li>
  );
}
