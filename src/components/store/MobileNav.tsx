"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const nav = [
  { href: "/shop", label: "Shop" },
  { href: "/#categories", label: "Categories" },
  { href: "/delivery", label: "Delivery" },
  { href: "/bulk-orders", label: "Bulk orders" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl border border-navy/15 bg-white text-navy lg:hidden"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

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
    </>
  );
}
