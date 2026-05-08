import bcrypt from "bcryptjs";

// SECURITY: 비회원 게시판의 본인 확인용 해시. 회원 인증 자산이 아니라 글 수정·삭제
// 차단용도라 saltRounds 10 이면 충분. 진짜 인증은 Supabase Auth(admin) 가 담당한다.
const SALT_ROUNDS = 10;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
