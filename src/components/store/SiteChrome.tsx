"use client";

import { FooterBrand } from "@/components/store/FooterBrand";
import { OrderLink } from "@/components/store/OrderLink";
import { StoreSearch } from "@/components/store/StoreSearch";
import { BUSINESS } from "@/lib/constants";
import { MapPin, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";

const nav = [
  { href: "/shop", label: "Shop" },
  { href: "/#categories", label: "Categories" },
  { href: "/delivery", label: "Delivery" },
  { href: "/bulk-orders", label: "Bulk orders" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

type CategoryLink = {
  id: string;
  name: string;
  slug: string;
};

export function Header({ categories = [] }: { categories?: CategoryLink[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 bg-paper/95 shadow-[0_1px_0_rgba(22,52,76,0.08)] backdrop-blur supports-[padding:max(0px)]:pt-[env(safe-area-inset-top)]">
      <div className="site-container flex min-w-0 items-center gap-2 py-2 sm:gap-4 sm:py-3">
        <Link
          href="/"
          className="relative z-[45] inline-flex shrink-0 items-center rounded-lg focus-visible:outline-offset-4"
          onClick={() => setOpen(false)}
        >
          <Image
            src="/logo/velora-mark.png"
            alt="Velora Medical Supplies"
            width={160}
            height={48}
            className="h-9 w-auto object-contain sm:h-11"
            priority
          />
        </Link>

        <Link
          href="/delivery"
          className="hidden min-w-0 items-center gap-1.5 rounded-xl border border-navy/10 bg-white px-3 py-2 text-left md:flex"
        >
          <MapPin className="h-4 w-4 shrink-0 text-teal" aria-hidden />
          <span className="min-w-0">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-navy/50">
              Delivering from
            </span>
            <span className="block truncate text-sm font-semibold text-navy">{BUSINESS.area}</span>
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 lg:block">
          <StoreSearch inputId="store-search-desktop" />
        </div>

        <nav className="hidden items-center gap-4 text-sm font-medium text-navy xl:flex">
          {nav.slice(0, 4).map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-teal">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link
            href="/track-order"
            className="hidden rounded-xl px-3 py-2 text-sm font-medium text-navy hover:text-teal lg:inline"
          >
            Track order
          </Link>
          <OrderLink />
          <button
            type="button"
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl border border-navy/15 bg-white text-navy lg:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="site-container pb-2 lg:hidden">
        <StoreSearch compact inputId="store-search-mobile" />
      </div>

      {categories.length > 0 ? (
        <nav aria-label="Product categories" className="border-t border-navy/8 bg-white">
          <div className="site-container">
            <div className="scroll-row py-2">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/shop?category=${category.slug}`}
                  className="scroll-row-item rounded-full border border-navy/10 bg-paper px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-navy hover:border-teal/40 hover:text-teal"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      ) : null}

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
              <Link href="/" className="inline-flex shrink-0" onClick={() => setOpen(false)}>
                <Image
                  src="/logo/velora-mark.png"
                  alt="Velora Medical Supplies"
                  width={140}
                  height={40}
                  className="h-10 w-auto object-contain"
                />
              </Link>
              <button
                type="button"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-navy"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
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
      <div className="site-container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="min-w-0">
          <FooterBrand />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/75">
            Medical supplies for home care, clinics and facilities. Order online or visit the Nairobi
            shop.
          </p>
        </div>
        <div className="min-w-0 text-sm text-cream/85">
          <p className="font-medium text-cream">Shop</p>
          <FooterLink href="/shop">All products</FooterLink>
          <FooterLink href="/delivery">Delivery</FooterLink>
          <FooterLink href="/bulk-orders">Bulk / clinic orders</FooterLink>
          <FooterLink href="/track-order">Track your order</FooterLink>
          <FooterLink href="/your-order">Your order</FooterLink>
        </div>
        <div className="min-w-0 text-sm text-cream/85">
          <p className="font-medium text-cream">Company</p>
          <FooterLink href="/about">About Velora</FooterLink>
          <FooterLink href="/contact">Contact</FooterLink>
          <FooterLink href="/delivery">Pickup at the Nairobi shop</FooterLink>
        </div>
        <div className="min-w-0 text-sm text-cream/85">
          <p className="font-medium text-cream">Visit & contact</p>
          <p className="mt-2 break-anywhere">{BUSINESS.location}</p>
          <p className="mt-1 break-anywhere">{BUSINESS.landmark}</p>
          <p className="mt-3">{BUSINESS.phoneDisplay}</p>
        </div>
      </div>
      <div className="site-container flex flex-col gap-4 border-t border-cream/10 py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-cream/70">© 2026 Velora Medical Supplies</p>
        <div className="flex flex-wrap gap-2">
          {["M-Pesa", "Cash", "Pay on delivery"].map((method) => (
            <span
              key={method}
              className="rounded-md border border-cream/20 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-cream/90"
            >
              {method}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <p className="mt-2">
      <Link href={href} className="text-cream underline decoration-cream/40">
        {children}
      </Link>
    </p>
  );
}
