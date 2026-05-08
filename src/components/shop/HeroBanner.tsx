import Link from "next/link";

import { Button } from "@/components/ui/button";

export function HeroBanner() {
  return (
    <section
      aria-label="메인 배너"
      className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white"
    >
      <div className="relative mx-auto flex min-h-[200px] max-w-7xl flex-col justify-center gap-3 px-4 py-10 md:min-h-[360px] md:gap-5 md:px-6 md:py-20">
        <h2 className="text-2xl font-bold leading-tight md:text-4xl">
          사내 인쇄물 주문,
          <br />한 곳에서 빠르게.
        </h2>
        <p className="max-w-md text-sm text-slate-300 md:text-base">
          명함부터 배너까지 — 필요한 모든 인쇄물을 즉시 주문하세요.
        </p>
        <div className="mt-2 flex">
          <Button
            asChild
            size="lg"
            className="bg-white text-slate-900 hover:bg-white/90"
          >
            <Link href="#categories">지금 주문하기</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
