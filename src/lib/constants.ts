export const BUSINESS = {
  name: "Velora Medical Supplies",
  shortName: "Velora",
  tagline: "Medical supplies delivered to your doorstep.",
  slogan: "Quality you can trust. Care you can count on.",
  phoneDisplay: "+254 746 956 742",
  whatsapp: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "254746956742").trim(),
  location: "Travis House, 3rd Floor, Shop A6, Mfangano Street, Nairobi",
  landmark: "The building with Quickmart supermarket, near Afya Centre",
} as const;

/** Highest quantity a customer can request per product. Wendy still confirms availability. */
export const MAX_ORDER_LINE_QTY = 500;

export const SOURCES = [
  "WEBSITE",
  "TIKTOK",
  "WHATSAPP",
  "GOOGLE",
  "FACEBOOK",
  "JUMIA",
  "JIJI",
  "REFERRAL",
  "WALK_IN",
  "OTHER",
] as const;
