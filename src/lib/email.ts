import { Resend } from "resend";
import { emailEnabled, emailFromAddress, emailReplyTo } from "./email-config";

let client: Resend | null = null;

function resendClient() {
  if (!emailEnabled()) return null;
  if (!client) client = new Resend(process.env.RESEND_API_KEY!.trim());
  return client;
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const resend = resendClient();
  const from = emailFromAddress();

  if (!resend) {
    console.info("[email skipped — RESEND_API_KEY not set]", input.to, input.subject);
    return { ok: true as const, skipped: true as const };
  }

  const result = await resend.emails.send({
    from: from.formatted,
    replyTo: emailReplyTo(),
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return { ok: true as const, skipped: false as const, id: result.data?.id };
}
