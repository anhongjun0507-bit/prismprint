"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { deleteQnaPostAction } from "@/app/(shop)/qna/actions";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface QnaDeleteButtonProps {
  postId: string;
  // admin 으로 로그인된 상태면 비밀번호 입력 없이 즉시 삭제 가능.
  isAdmin: boolean;
}

export function QnaDeleteButton({ postId, isAdmin }: QnaDeleteButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    setPending(true);
    setError(null);
    const res = await deleteQnaPostAction(
      postId,
      isAdmin ? null : password,
    );
    setPending(false);
    if (res.ok) {
      setOpen(false);
      router.push("/qna");
      router.refresh();
    } else {
      setError(res.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          글 삭제
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>글을 삭제할까요?</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            삭제한 글은 복구할 수 없습니다.
          </p>
          {!isAdmin && (
            <div className="space-y-2">
              <Label htmlFor="qna-delete-password">비밀번호</Label>
              <Input
                id="qna-delete-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="off"
              />
            </div>
          )}
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={pending}
          >
            {pending ? "삭제 중..." : "삭제"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
