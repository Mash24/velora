"use client";

import { BrandLogo } from "@/components/store/BrandLogo";
import { OrderLink } from "@/components/store/OrderLink";
import { BUSINESS } from "@/lib/constants";
import { whatsappLink } from "@/lib/whatsapp";
import Link from "next/link";
import { useEffect, useState } from "react";

const nav = [
  { href: "/shop", label: "Shop" },
  { href: "/#categories", label: "Categories" },
  { href: "/delivery", label: "Delivery" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-navy/10 bg-paper/95 backdrop-blur supports-[padding:max(0px)]:pt-[env(safe-area-inset-top)]">
      <div className="site-container flex min-w-0 items-center justify-between gap-3 py-3 sm:gap-4 sm:py-4">
        <Link href="/" className="min-w-0 shrink" onClick={() => setOpen(false)}>
          <BrandLogo className="h-10 w-auto sm:h-12 md:h-14" priority />
        </Link>
        <nav className="hidden min-w-0 items-center gap-6 text-[15px] font-medium text-navy lg:flex xl:gap-8">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-teal">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <OrderLink />
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-navy/15 bg-white text-sm font-medium text-navy lg:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-navy/40 lg:hidden"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <nav className="fixed inset-x-0 top-0 z-50 flex max-h-[100dvh] flex-col bg-paper pt-[max(0.75rem,env(safe-area-inset-top))] shadow-lg lg:hidden">
            <div className="flex items-center justify-between border-b border-navy/10 px-4 py-3">
              <span className="font-semibold text-navy">Menu</span>
              <button
                type="button"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-sm font-medium text-navy"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex min-h-11 items-center rounded-xl px-3 text-base text-navy"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/your-order"
                className="flex min-h-11 items-center rounded-xl px-3 text-base font-medium text-navy"
                onClick={() => setOpen(false)}
              >
                Your order
              </Link>
              <Link
                href="/track-order"
                className="flex min-h-11 items-center rounded-xl px-3 text-base text-navy"
                onClick={() => setOpen(false)}
              >
                Track your order
              </Link>
            </div>
          </nav>
        </>
      ) : null}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-teal-950/10 bg-navy text-cream safe-bottom">
      <div className="site-container grid gap-10 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="min-w-0">
          <BrandLogo className="h-14 w-auto sm:h-16" />
          <p className="mt-3 max-w-xs text-sm text-cream/85">
            Medical supplies and equipment for home care, healthcare professionals and facilities.
          </p>
        </div>
        <div className="min-w-0 text-sm text-cream/85">
          <p className="font-medium text-cream">Visit us</p>
          <p className="mt-2 break-anywhere">{BUSINESS.location}</p>
          <p className="mt-1 break-anywhere">Near Afya Centre, in the building with Quickmart</p>
        </div>
        <div className="min-w-0 text-sm text-cream/85">
          <p className="font-medium text-cream">Contact</p>
          <p className="mt-2">{BUSINESS.phoneDisplay}</p>
          <p className="mt-2">
            <a
              className="text-cream underline decoration-cream/40"
              href={whatsappLink("Hello Velora, I have a question.")}
            >
              WhatsApp
            </a>
          </p>
        </div>
        <div className="min-w-0 text-sm text-cream/85">
          <p className="font-medium text-cream">Shop</p>
          <p className="mt-2">
            <Link href="/shop" className="text-cream underline decoration-cream/40">
              All products
            </Link>
          </p>
          <p className="mt-1">
            <Link href="/track-order" className="text-cream underline decoration-cream/40">
              Track your order
            </Link>
          </p>
          <p className="mt-1">
            <Link href="/your-order" className="text-cream underline decoration-cream/40">
              Your order
            </Link>
          </p>
          <p className="mt-1">
            <Link href="/delivery" className="text-cream underline decoration-cream/40">
              Delivery
            </Link>
          </p>
          <p className="mt-4 font-medium text-cream">Business</p>
          <p className="mt-2">
            <Link href="/about" className="text-cream underline decoration-cream/40">
              About Velora
            </Link>
          </p>
          <p className="mt-1">
            <Link href="/bulk-orders" className="text-cream underline decoration-cream/40">
              Bulk orders
            </Link>
          </p>
          <p className="mt-1">
            <Link href="/contact" className="text-cream underline decoration-cream/40">
              Contact
            </Link>
          </p>
        </div>
      </div>
      <div className="site-container pb-8 text-sm text-cream/70">
        © 2026 Velora Medical Supplies
      </div>
    </footer>
  );
}
