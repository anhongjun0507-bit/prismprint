import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "프린트샵",
  description: "사내 인쇄물 주문 사이트",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={notoSansKr.variable}>
      <body className="flex min-h-screen flex-col antialiased">
        {children}
        <Toaster richColors position="bottom-center" />
      </body>
    </html>
  );
}
