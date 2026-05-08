import Link from "next/link";
import { ArrowRight, Clock, Shield, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";

export function HeroBanner() {
  return (
    <section
      aria-label="메인 배너"
      className="relative overflow-hidden bg-[#0f3760] text-white"
    >
      {/* 배경 패턴 — 라이트 빛 효과 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 0%, rgba(255,255,255,0.18) 0%, transparent 35%), radial-gradient(circle at 80% 100%, rgba(99,179,237,0.18) 0%, transparent 40%)",
        }}
      />
      {/* 도트 패턴 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-16 md:grid-cols-[1.4fr_1fr] md:items-center md:gap-12 md:px-6 md:py-24 lg:py-28">
        <div className="flex flex-col gap-5">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            지금 주문 가능
          </div>

          <h1 className="text-3xl font-bold leading-[1.15] tracking-tight md:text-5xl lg:text-6xl">
            인쇄가 필요한 모든 순간,
            <br />
            <span className="bg-gradient-to-r from-sky-200 to-white bg-clip-text text-transparent">
              한 곳에서 빠르게
            </span>
          </h1>

          <p className="max-w-lg text-base text-slate-200 md:text-lg">
            명함부터 배너까지 — 사내에서 자주 쓰는 인쇄물을 원클릭으로 주문하고
            영업일 기준 2~5일 내 받아보세요.
          </p>

          <div className="mt-2 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="h-12 bg-white px-6 text-base font-semibold text-[#0f3760] shadow-lg shadow-black/20 hover:bg-white/95"
            >
              <Link href="#categories" className="gap-2">
                지금 주문하기
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 border-white/40 bg-white/0 px-6 text-base font-medium text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/order/lookup">주문 조회</Link>
            </Button>
          </div>

          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-200">
            <li className="inline-flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-sky-300" />
              영업일 2~5일 출고
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-sky-300" />
              비회원 무통장입금
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-sky-300" />
              평일 09:00 - 18:00 응대
            </li>
          </ul>
        </div>

        {/* 우측: 데코 카드 — 인쇄물 스택 일러스트 느낌 */}
        <div className="relative hidden md:block">
          <div className="relative mx-auto h-[280px] w-full max-w-sm">
            <div className="absolute right-12 top-0 h-44 w-72 rotate-[-6deg] rounded-xl bg-gradient-to-br from-sky-100 to-white/90 p-5 shadow-2xl shadow-black/30">
              <div className="text-xs font-semibold tracking-widest text-sky-700">
                BUSINESS CARD
              </div>
              <div className="mt-3 h-1 w-12 rounded-full bg-[#0f3760]" />
              <div className="mt-3 text-lg font-bold text-slate-900">
                Hong Gildong
              </div>
              <div className="text-xs text-slate-500">대표</div>
              <div className="mt-3 text-[10px] leading-relaxed text-slate-500">
                +82 10-0000-0000
                <br />
                hong@example.com
              </div>
            </div>
            <div className="absolute right-0 top-20 h-44 w-72 rotate-[4deg] rounded-xl bg-gradient-to-br from-amber-50 to-white/90 p-5 shadow-2xl shadow-black/40">
              <div className="text-xs font-semibold tracking-widest text-amber-700">
                STICKER
              </div>
              <div className="mt-3 flex gap-2">
                <span className="h-8 w-8 rounded-full bg-amber-300/60" />
                <span className="h-8 w-8 rounded-full bg-rose-300/60" />
                <span className="h-8 w-8 rounded-full bg-sky-300/60" />
              </div>
              <div className="mt-4 text-sm font-semibold text-slate-900">
                원형 컷팅 도무송
              </div>
              <div className="text-xs text-slate-500">100매부터</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
