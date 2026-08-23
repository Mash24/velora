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
      <div className="site-container grid items-center gap-8 py-6 sm:gap-10 sm:py-10 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <div className="min-w-0">
          <div className="lg:hidden">
            <ProductCollage items={collageItems} />
          </div>

          {fromTiktok ? (
            <p className="mt-4 text-sm font-medium text-teal lg:mt-0">
              Welcome from TikTok — order right here.
            </p>
          ) : null}

          <p
            className={`text-xs font-medium uppercase tracking-[0.1em] text-teal sm:text-sm ${fromTiktok ? "mt-3" : "mt-4 lg:mt-0"}`}
          >
            Nairobi shop · Delivery across Kenya
          </p>

          <h1 className="page-heading mt-2 max-w-xl sm:mt-4">
            Medical supplies for home, work and healthcare.
          </h1>

          <p className="mt-3 max-w-lg text-sm leading-6 text-navy/85 sm:hidden">
            Browse our shop, submit your order request, and we&apos;ll confirm before payment.
          </p>
          <p className="mt-6 hidden max-w-lg text-lg leading-8 text-navy sm:block">
            Browse medical supplies from our Nairobi shop. Choose what you need, submit your order
            request and we&apos;ll confirm availability and delivery before payment.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:mt-8">
            <Link
              href="/shop"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-teal px-6 text-sm font-semibold text-cream transition hover:bg-teal/90 sm:h-12 sm:w-fit sm:px-8"
            >
              Shop products
            </Link>

            <form action="/shop" method="get" className="relative min-w-0">
              <label className="sr-only" htmlFor="home-search">
                Search products
              </label>
              <Search
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-navy/35"
                aria-hidden
              />
              <input
                id="home-search"
                name="q"
                placeholder="Search gloves, masks, stethoscopes…"
                className="h-11 w-full min-w-0 rounded-xl border border-navy/12 bg-white pr-11 pl-9 text-base text-navy outline-none placeholder:text-navy/40 focus:border-teal/40 focus:ring-2 focus:ring-teal/15"
              />
              <button
                type="submit"
                className="absolute top-1/2 right-1.5 inline-flex h-8 min-w-8 -translate-y-1/2 items-center justify-center rounded-lg border border-navy/10 bg-paper px-2 text-xs font-medium text-navy/75 transition hover:border-teal/30 hover:text-teal"
                aria-label="Search products"
              >
                Go
              </button>
            </form>
          </div>
        </div>

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
