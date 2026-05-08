"use client";

import { useEffect, useState } from "react";

/**
 * SSR과 첫 클라이언트 렌더의 결과가 동일하도록 보장하기 위한 훅.
 *
 * Zustand persist(localStorage)처럼 클라이언트에서만 값이 채워지는 상태를
 * 첫 렌더에 그대로 사용하면 hydration mismatch 경고가 뜬다. 이 훅을 통해
 * 첫 렌더는 unmounted(false)로 두고 useEffect 이후 mounted(true)로 전환한다.
 */
export function useHasMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
