import { BUSINESS } from "./constants";

export function emailFromAddress() {
  const address = (process.env.EMAIL_FROM ?? "orders@veloramedicalsupplies.co.ke").trim();
  const name = (process.env.EMAIL_FROM_NAME ?? BUSINESS.name).trim();
  return { address, name, formatted: `${name} <${address}>` };
}

export function emailReplyTo() {
  return (process.env.EMAIL_REPLY_TO ?? emailFromAddress().address).trim();
}

export function emailEnabled() {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}
