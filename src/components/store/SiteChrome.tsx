import { BUSINESS } from "@/lib/constants";
import { whatsappLink } from "@/lib/whatsapp";
import Link from "next/link";

const nav = [
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-teal-950/10 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-teal text-sm font-semibold text-cream">
            V
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold text-navy">Velora</span>
            <span className="block text-[11px] uppercase tracking-[0.18em] text-teal">
              Medical Supplies
            </span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-navy/80 sm:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-teal">
              {item.label}
            </Link>
          ))}
        </nav>
        <a
          href={whatsappLink("Hi Velora, I would like to make an enquiry.")}
          className="rounded-full bg-whatsapp px-4 py-2 text-sm font-medium text-white"
        >
          WhatsApp {BUSINESS.phoneDisplay}
        </a>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-teal-950/10 bg-navy text-cream">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="font-semibold">{BUSINESS.name}</p>
          <p className="mt-2 max-w-xs text-sm text-cream/70">{BUSINESS.tagline}</p>
        </div>
        <div className="text-sm text-cream/80">
          <p className="font-medium text-cream">Shop</p>
          <p className="mt-2">{BUSINESS.location}</p>
          <p className="mt-1">{BUSINESS.landmark}</p>
        </div>
        <div className="text-sm text-cream/80">
          <p className="font-medium text-cream">Order</p>
          <p className="mt-2">M-Pesa payments</p>
          <p>Nairobi riders · Nationwide delivery</p>
          <p className="mt-2">{BUSINESS.phoneDisplay}</p>
        </div>
      </div>
    </footer>
  );
}
