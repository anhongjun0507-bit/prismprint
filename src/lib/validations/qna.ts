import { z } from "zod";

export const createQnaSchema = z.object({
  author_name: z
    .string()
    .trim()
    .min(2, "이름은 2자 이상 입력해주세요")
    .max(30, "이름은 30자 이하로 입력해주세요"),
  password: z
    .string()
    .min(4, "비밀번호는 4자 이상 입력해주세요")
    .max(64, "비밀번호는 64자 이하로 입력해주세요"),
  title: z
    .string()
    .trim()
    .min(2, "제목은 2자 이상 입력해주세요")
    .max(100, "제목은 100자 이하로 입력해주세요"),
  content: z
    .string()
    .trim()
    .min(5, "내용은 5자 이상 입력해주세요")
    .max(2000, "내용은 2000자 이하로 입력해주세요"),
  is_secret: z.boolean(),
});

export type CreateQnaInput = z.infer<typeof createQnaSchema>;

export const verifyPasswordSchema = z.object({
  password: z
    .string()
    .min(4, "비밀번호는 4자 이상 입력해주세요")
    .max(64, "비밀번호는 64자 이하로 입력해주세요"),
});

export type VerifyPasswordInput = z.infer<typeof verifyPasswordSchema>;

export const createReplySchema = z.object({
  content: z
    .string()
    .trim()
    .min(2, "답변은 2자 이상 입력해주세요")
    .max(2000, "답변은 2000자 이하로 입력해주세요"),
});

export type CreateReplyInput = z.infer<typeof createReplySchema>;
