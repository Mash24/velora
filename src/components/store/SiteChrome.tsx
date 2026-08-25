import { FooterBrand } from "@/components/store/FooterBrand";
import { MobileNav } from "@/components/store/MobileNav";
import { OrderLink } from "@/components/store/OrderLink";
import { StoreSearch } from "@/components/store/StoreSearch";
import { BUSINESS } from "@/lib/constants";
import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

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

/** Server Header — only search, order badge, and mobile menu hydrate. */
export function Header({ categories = [] }: { categories?: CategoryLink[] }) {
  return (
    <header className="sticky top-0 z-40 bg-paper/95 shadow-[0_1px_0_rgba(22,52,76,0.08)] backdrop-blur supports-[padding:max(0px)]:pt-[env(safe-area-inset-top)]">
      <div className="site-container flex min-w-0 items-center gap-2 py-2 sm:gap-4 sm:py-3">
        <Link
          href="/"
          className="relative z-[45] inline-flex shrink-0 items-center rounded-lg focus-visible:outline-offset-4"
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
          <MobileNav />
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
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-navy/10 bg-mist text-navy safe-bottom">
      <div className="site-container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="min-w-0">
          <FooterBrand />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-navy/70">
            Medical supplies for home care, clinics and facilities. Order online or visit the Nairobi
            shop.
          </p>
        </div>
        <div className="min-w-0 text-sm text-navy/80">
          <p className="font-semibold text-navy">Shop</p>
          <FooterLink href="/shop">All products</FooterLink>
          <FooterLink href="/delivery">Delivery</FooterLink>
          <FooterLink href="/bulk-orders">Bulk / clinic orders</FooterLink>
          <FooterLink href="/track-order">Track your order</FooterLink>
          <FooterLink href="/your-order">Your order</FooterLink>
        </div>
        <div className="min-w-0 text-sm text-navy/80">
          <p className="font-semibold text-navy">Company</p>
          <FooterLink href="/about">About Velora</FooterLink>
          <FooterLink href="/contact">Contact</FooterLink>
          <FooterLink href="/delivery">Pickup at the Nairobi shop</FooterLink>
        </div>
        <div className="min-w-0 text-sm text-navy/80">
          <p className="font-semibold text-navy">Visit & contact</p>
          <p className="mt-2 break-anywhere">{BUSINESS.location}</p>
          <p className="mt-1 break-anywhere">{BUSINESS.landmark}</p>
          <p className="mt-3 font-medium text-navy">{BUSINESS.phoneDisplay}</p>
        </div>
      </div>
      <div className="site-container flex flex-col gap-4 border-t border-navy/10 py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-navy/60">© 2026 Velora Medical Supplies</p>
        <div className="flex flex-wrap gap-2">
          {["M-Pesa", "Cash", "Pay on delivery"].map((method) => (
            <span
              key={method}
              className="rounded-md border border-navy/15 bg-white px-2.5 py-1 text-[11px] font-semibold tracking-wide text-navy/80"
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
      <Link href={href} className="text-navy/75 underline decoration-navy/25 transition hover:text-teal hover:decoration-teal/40">
        {children}
      </Link>
    </p>
  );
}
