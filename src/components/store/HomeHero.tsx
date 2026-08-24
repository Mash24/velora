import { ProductCollage } from "@/components/store/ProductCollage";
import { BrandLogo } from "@/components/store/BrandLogo";
import { Search } from "lucide-react";
import Link from "next/link";

type CollageItem = {
  url: string;
  alt: string;
  slug: string;
};

type HomeHeroProps = {
  fromTiktok: boolean;
  collageItems: CollageItem[];
};

export function HomeHero({ fromTiktok, collageItems }: HomeHeroProps) {
  return (
    <section className="border-b border-navy/10 bg-paper">
      <div className="site-container grid items-center gap-6 py-5 sm:gap-10 sm:py-10 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <div className="min-w-0">
          {/* Product collage — mobile only, above the headline */}
          <div className="lg:hidden">
            <ProductCollage items={collageItems} />
          </div>

          {fromTiktok ? (
            <p className="mt-4 text-sm font-medium text-teal lg:mt-0">
              Welcome from TikTok — order right here.
            </p>
          ) : null}

          <p
            className={`text-xs font-semibold uppercase tracking-[0.12em] text-teal sm:text-sm ${fromTiktok ? "mt-2" : "mt-3 lg:mt-0"}`}
          >
            Nairobi shop · Delivery across Kenya
          </p>

          <h1 className="page-heading mt-2">
            Medical supplies for home, work and healthcare.
          </h1>

          {/* Shorter on mobile, fuller on sm+ */}
          <p className="mt-2 text-sm leading-relaxed text-navy/75 sm:hidden">
            Browse, request an order, and we&apos;ll confirm before you pay.
          </p>
          <p className="mt-5 hidden max-w-lg text-lg leading-8 text-navy sm:block">
            Browse medical supplies from our Nairobi shop. Choose what you need, submit your order
            request and we&apos;ll confirm availability and delivery before payment.
          </p>

          {/* CTAs */}
          <div className="mt-4 flex flex-col gap-2.5 sm:mt-7 sm:gap-3">
            {/* Primary — coral accent, high contrast */}
            <Link
              href="/shop"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-coral px-7 text-sm font-bold text-white shadow-[0_4px_14px_rgba(196,92,38,0.35)] transition hover:bg-coral/90 active:scale-[0.98] sm:w-fit"
            >
              Shop products
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>

            {/* Search bar — visible border, filled "Go" pill */}
            <form action="/shop" method="get" className="relative min-w-0">
              <label className="sr-only" htmlFor="home-search">Search products</label>
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-navy/40"
                aria-hidden
              />
              <input
                id="home-search"
                name="q"
                placeholder="Search gloves, masks, stethoscopes…"
                className="h-12 w-full min-w-0 rounded-xl border-2 border-navy/20 bg-white pr-20 pl-10 text-base text-navy outline-none placeholder:text-navy/35 focus:border-teal/50 focus:ring-2 focus:ring-teal/10"
              />
              <button
                type="submit"
                className="absolute top-1/2 right-1.5 inline-flex h-9 -translate-y-1/2 items-center justify-center rounded-lg bg-navy px-4 text-xs font-semibold text-cream transition hover:bg-teal"
                aria-label="Search products"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {/* Desktop decoration */}
        <div className="relative hidden min-h-[420px] items-center justify-center lg:flex">
          <div className="absolute inset-8 rounded-full border border-teal/20" />
          <div className="absolute inset-16 rounded-full border border-navy/10" />
          <div className="relative p-8 sm:p-12">
            <BrandLogo className="h-44 w-auto" priority />
          </div>
        </div>
      </div>
    </section>
  );
}
