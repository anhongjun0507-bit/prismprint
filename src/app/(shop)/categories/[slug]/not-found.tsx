import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function CategoryNotFound() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-6 px-4 py-16 text-center md:py-24">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold md:text-3xl">
          카테고리를 찾을 수 없습니다
        </h1>
        <p className="text-muted-foreground">
          요청하신 카테고리가 존재하지 않거나 이동되었습니다.
        </p>
      </div>
      <Button asChild>
        <Link href="/">메인으로 돌아가기</Link>
      </Button>
    </div>
  );
}
