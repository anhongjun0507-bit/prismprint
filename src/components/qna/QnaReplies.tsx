import { formatQnaDate } from "@/lib/qna-format";

import type { QnaReply } from "@/types";

interface QnaRepliesProps {
  replies: QnaReply[];
}

export function QnaReplies({ replies }: QnaRepliesProps) {
  if (replies.length === 0) {
    return (
      <p className="rounded-md border border-dashed bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
        아직 답변이 없습니다.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {replies.map((reply) => (
        <li
          key={reply.id}
          className="ml-4 rounded-md border-l-4 border-primary/40 bg-primary/5 p-4 sm:ml-6"
        >
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold text-primary">관리자 답변</span>
            <time dateTime={reply.created_at}>
              {formatQnaDate(reply.created_at)}
            </time>
          </div>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {reply.content}
          </div>
        </li>
      ))}
    </ul>
  );
}
