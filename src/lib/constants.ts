export const BUSINESS = {
  name: "Velora Medical Supplies",
  shortName: "Velora",
  tagline: "Medical supplies delivered to your doorstep.",
  slogan: "Quality you can trust. Care you can count on.",
  phoneDisplay: "+254 746 956 742",
  whatsapp: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "254746956742").trim(),
  location: "Travis House, 3rd Floor, Shop A6, Mfangano Street, Nairobi",
  landmark: "The building with Quickmart supermarket, near Afya Centre",
  area: "Nairobi CBD",
} as const;

const mapsQuery = encodeURIComponent("Travis House Mfangano Street Nairobi");

export const MAPS_SEARCH_URL = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
export const MAPS_EMBED_URL = `https://maps.google.com/maps?q=${mapsQuery}&z=16&output=embed`;

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
