import { Resend } from "resend";

// RESEND_API_KEY 가 있을 때만 실제 발송. 없으면 콘솔에 로그만 남기고 graceful skip.
// 운영 전 도메인 인증 후 .env.local 에 키를 채우면 즉시 발송 시작.
let cached: Resend | null | undefined;

function getResend(): Resend | null {
  if (cached !== undefined) return cached;
  const key = process.env.RESEND_API_KEY;
  cached = key ? new Resend(key) : null;
  return cached;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export interface SendEmailResult {
  ok: boolean;
  // 키가 없어 의도적으로 발송 안 한 경우.
  skipped?: boolean;
  error?: string;
}

export async function sendEmail(
  options: SendEmailOptions,
): Promise<SendEmailResult> {
  const client = getResend();
  const from =
    process.env.RESEND_FROM_EMAIL ?? "PrismPrint <onboarding@resend.dev>";

  if (!client) {
    console.warn(
      `[email skipped] RESEND_API_KEY 없음. to=${options.to} subject="${options.subject}"`,
    );
    return { ok: true, skipped: true };
  }

  try {
    const { error } = await client.emails.send({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    if (error) {
      console.error("Resend send error:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err) {
    console.error("Resend exception:", err);
    return { ok: false, error: "이메일 발송 중 오류가 발생했습니다." };
  }
}
