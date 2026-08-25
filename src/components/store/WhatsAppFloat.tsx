"use client";

import { BUSINESS } from "@/lib/constants";
import { whatsappLink } from "@/lib/whatsapp";
import { usePathname } from "next/navigation";

/** Hide on checkout so it doesn’t cover Place order / form actions. */
const HIDDEN_ON = ["/your-order"];

export function WhatsAppFloat() {
  const pathname = usePathname();
  if (HIDDEN_ON.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return null;
  }

  return (
    <a
      href={whatsappLink("Hello Velora, I need help with an order.")}
      className="fixed right-4 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-[0_10px_30px_rgba(18,140,126,0.45)] transition hover:scale-105 active:scale-95"
      style={{ bottom: "max(1rem, env(safe-area-inset-bottom, 0px))" }}
      aria-label={`Chat with ${BUSINESS.shortName} on WhatsApp`}
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden>
        <path d="M12.04 2C6.58 2 2.15 6.4 2.15 11.84c0 1.74.46 3.44 1.32 4.94L2 22l5.38-1.4a10 10 0 0 0 4.66 1.18h.01c5.46 0 9.89-4.4 9.89-9.84C21.94 6.4 17.5 2 12.04 2Zm5.76 14.13c-.24.68-1.4 1.3-1.94 1.38-.5.07-1.12.1-1.81-.11-.42-.13-.95-.31-1.64-.6-2.89-1.25-4.77-4.14-4.92-4.34-.14-.2-1.18-1.57-1.18-3 0-1.42.74-2.12 1-2.41.24-.28.64-.41.86-.41h.62c.2 0 .46-.07.72.55.24.62.83 2.14.9 2.3.08.16.12.35.02.55-.1.2-.14.32-.28.5-.14.16-.3.37-.42.5-.14.14-.28.3-.12.58.16.28.7 1.15 1.5 1.86 1.04.92 1.9 1.2 2.2 1.34.28.14.45.12.62-.07.16-.2.7-.81.88-1.09.2-.28.37-.23.62-.14.24.1 1.54.73 1.8.86.28.14.45.2.52.31.08.12.08.68-.16 1.36Z" />
      </svg>
    </a>
  );
}
