import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role 클라이언트 — RLS 를 우회한다.
// 비회원이 비밀번호 검증을 통과한 경우 본인 글 삭제처럼, 서버측에서 별도로
// 권한을 검증한 다음에만 사용해야 한다. 일반 데이터 조회는 server.ts 의
// createClient 를 사용한다.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
