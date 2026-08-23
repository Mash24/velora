import { CustomerSource } from "@prisma/client";

const allowed = new Set<string>(Object.values(CustomerSource));

export function parseSource(value?: string | null): CustomerSource {
  if (!value) return CustomerSource.WEBSITE;
  const normalised = value.trim().toUpperCase();
  if (allowed.has(normalised)) return normalised as CustomerSource;
  return CustomerSource.WEBSITE;
}

export function sourceLabel(source: string) {
  const labels: Record<string, string> = {
    WEBSITE: "Website",
    TIKTOK: "TikTok",
    WHATSAPP: "WhatsApp",
    GOOGLE: "Google",
    FACEBOOK: "Facebook",
    JUMIA: "Jumia",
    JIJI: "Jiji",
    REFERRAL: "Referral",
    WALK_IN: "Shop visit",
    OTHER: "Other",
  };
  return labels[source] ?? source;
}
