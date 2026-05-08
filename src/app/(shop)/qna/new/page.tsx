import { QnaNewForm } from "@/components/qna/QnaNewForm";

export const metadata = {
  title: "Q&A 글쓰기",
};

export default function QnaNewPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <header className="mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold md:text-3xl">Q&amp;A 글쓰기</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          비회원으로 작성합니다. 글 수정·삭제 시 비밀번호가 필요하니 잊지 마세요.
        </p>
      </header>
      <QnaNewForm />
    </div>
  );
}
