import { createClient } from "@/lib/supabase/server";
import { maskAuthorName } from "@/lib/qna-format";

import type { QnaPostListItem, QnaPostPublic, QnaReply } from "@/types";

export const QNA_PER_PAGE = 20;

export interface QnaListResult {
  posts: QnaPostListItem[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getQnaPosts(page = 1): Promise<QnaListResult> {
  const supabase = await createClient();
  const from = (page - 1) * QNA_PER_PAGE;
  const to = from + QNA_PER_PAGE - 1;

  const { data, error, count } = await supabase
    .from("qna_posts")
    .select(
      "id, author_name, title, is_secret, is_answered, created_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Failed to fetch qna posts:", error);
    return { posts: [], total: 0, page, totalPages: 1 };
  }

  // 비밀글 leak 방지:
  //   1) 비밀글 제목은 빈 문자열로 치환 — 컴포넌트에서 "비밀글입니다" 로 대체 표시.
  //   2) 작성자명은 서버에서 미리 마스킹 — RSC 직렬화 페이로드에도 raw 값이 들어가지 않게.
  // server component 의 props 도 RSC payload 에 직렬화돼 HTML 에 인라인되므로,
  // 시각적 컨디셔널만으론 페이지 소스 노출을 막을 수 없다.
  const posts: QnaPostListItem[] = (data ?? []).map((p) => ({
    id: p.id,
    title: p.is_secret ? "" : p.title,
    author_name: maskAuthorName(p.author_name),
    is_secret: p.is_secret,
    is_answered: p.is_answered,
    created_at: p.created_at,
  }));

  const total = count ?? 0;
  return {
    posts,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / QNA_PER_PAGE)),
  };
}

// 비밀글이라도 메타데이터(제목·작성자명·날짜·is_secret)는 헤더 표시에 필요하므로
// 가져온다. 본문(content) 은 비밀글일 경우 게이트 통과 전에는 클라이언트로
// 노출하지 않도록 호출하는 페이지에서 책임진다.
export async function getQnaPostById(
  id: string,
): Promise<QnaPostPublic | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("qna_posts")
    .select(
      "id, author_name, title, content, is_secret, is_answered, created_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch qna post:", error);
    return null;
  }
  return (data as QnaPostPublic | null) ?? null;
}

export async function getQnaReplies(postId: string): Promise<QnaReply[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("qna_replies")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch qna replies:", error);
    return [];
  }
  return (data ?? []) as QnaReply[];
}
