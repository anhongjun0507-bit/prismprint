import { z } from "zod";

export const createReviewSchema = z.object({
  author_name: z
    .string()
    .trim()
    .min(2, "이름은 2자 이상 입력해주세요")
    .max(30, "이름은 30자 이하로 입력해주세요"),
  password: z
    .string()
    .min(4, "비밀번호는 4자 이상 입력해주세요")
    .max(64, "비밀번호는 64자 이하로 입력해주세요"),
  rating: z.coerce
    .number()
    .int("별점은 정수입니다")
    .min(1, "별점을 선택해주세요")
    .max(5, "별점은 1~5 사이입니다"),
  title: z
    .string()
    .trim()
    .max(100, "제목은 100자 이하로 입력해주세요")
    .optional(),
  content: z
    .string()
    .trim()
    .min(5, "내용은 5자 이상 입력해주세요")
    .max(1000, "내용은 1000자 이하로 입력해주세요"),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const verifyReviewPasswordSchema = z.object({
  password: z
    .string()
    .min(4, "비밀번호는 4자 이상 입력해주세요")
    .max(64, "비밀번호는 64자 이하로 입력해주세요"),
});

export type VerifyReviewPasswordInput = z.infer<
  typeof verifyReviewPasswordSchema
>;
