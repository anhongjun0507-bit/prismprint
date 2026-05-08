"use client";

import { useState } from "react";
import { Lock } from "lucide-react";

import { verifyAndRevealAction } from "@/app/(shop)/qna/actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QnaReplies } from "@/components/qna/QnaReplies";

import type { QnaReply } from "@/types";

interface QnaSecretGateProps {
  postId: string;
}

interface Revealed {
  content: string;
  replies: QnaReply[];
}

export function QnaSecretGate({ postId }: QnaSecretGateProps) {
  const [revealed, setRevealed] = useState<Revealed | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (revealed) {
    return (
      <div className="space-y-8">
        <div className="whitespace-pre-wrap rounded-md border bg-background p-5 text-sm leading-relaxed">
          {revealed.content}
        </div>
        <section className="space-y-3">
          <h2 className="text-base font-bold md:text-lg">답변</h2>
          <QnaReplies replies={revealed.replies} />
        </section>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        const res = await verifyAndRevealAction(postId, password);
        if (res.ok) {
          setRevealed({ content: res.content, replies: res.replies });
        } else {
          setError(res.error);
        }
        setPending(false);
      }}
      className="space-y-4 rounded-md border bg-muted/30 p-6"
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        <Lock className="h-4 w-4" />
        비밀글입니다. 작성자만 열람할 수 있습니다.
      </div>
      <div className="space-y-2">
        <Label htmlFor="qna-secret-password">비밀번호</Label>
        <Input
          id="qna-secret-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="off"
          required
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "확인 중..." : "확인"}
      </Button>
    </form>
  );
}
