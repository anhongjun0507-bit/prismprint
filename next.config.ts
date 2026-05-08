import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Supabase Storage 의 public 버킷 URL 허용. next/image 가 외부 호스트
    // 이미지를 서빙하려면 remotePatterns 등록 필수.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
