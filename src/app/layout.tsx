import { BUSINESS } from "@/lib/constants";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://velora-brown-tau.vercel.app";
const enableSpeedInsights = process.env.VERCEL === "1";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Velora Medical Supplies",
    template: "%s | Velora Medical Supplies",
  },
  description:
    "Medical supplies from Nairobi, delivered across Kenya. Gloves, masks and everyday products for home care and healthcare.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_KE",
    siteName: BUSINESS.name,
    title: BUSINESS.name,
    description:
      "Find medical supplies, check prices, and order from our Nairobi shop. Delivery across Kenya.",
    images: [{ url: "/logo/velora-mark.png", alt: "Velora Medical Supplies" }],
  },
  icons: {
    icon: "/logo/velora-mark.png",
    apple: "/logo/velora-mark.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-KE" className={`${jakarta.variable} h-full antialiased`}>
      <body className={`${jakarta.className} min-h-full`}>
        {children}
        {enableSpeedInsights ? <SpeedInsights /> : null}
      </body>
    </html>
  );
}
