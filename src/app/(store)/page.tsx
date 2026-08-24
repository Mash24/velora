import { ProductCard } from "@/components/store/ProductCard";
import { CategoryGlyph } from "@/components/store/CategoryGlyph";
import { CategoryScrollRow } from "@/components/store/CategoryScrollRow";
import { HomeHero } from "@/components/store/HomeHero";
import { ProductScrollRow } from "@/components/store/ProductScrollRow";
import { BUSINESS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { CATEGORY_BLURBS } from "@/lib/category-blurbs";
import { categoryWithPublishedProducts, publishedProduct } from "@/lib/shop-query";
import { parseSource } from "@/lib/source";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

const mapsUrl =
  "https://www.google.com/maps/search/?api=1&query=Travis+House+Mfangano+Street+Nairobi";

const steps = [
  {
    n: "01",
    title: "Choose",
    detail: "Find the products you need and add them to your order.",
  },
  {
    n: "02",
    title: "Submit",
    detail: "Submit your order request on this website. You don’t pay yet.",
  },
  {
    n: "03",
    title: "We confirm",
    detail: "We check availability and confirm your total and delivery details.",
  },
  {
    n: "04",
    title: "Pay & receive",
    detail: "Pay using the agreed option, then we arrange delivery.",
  },
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>;
}) {
  const { source } = await searchParams;
  const fromTiktok = parseSource(source) === "TIKTOK" && Boolean(source);
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: publishedProduct,
      orderBy: [{ featured: "desc" }, { name: "asc" }],
      take: 6,
      include: { images: true },
    }),
    prisma.category.findMany({
      where: categoryWithPublishedProducts,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  ]);

  const collageItems = products.flatMap((product) => {
    const image = product.images[0];
    if (!image) return [];
    return [{ url: image.url, alt: image.alt || product.name, slug: product.slug }];
  });

  return (
    <>
      <HomeHero fromTiktok={fromTiktok} collageItems={collageItems} />

      {categories.length > 0 ? (
        <section id="categories" className="scroll-mt-20 md:scroll-mt-24">
          <CategoryScrollRow categories={categories} />
          <div className="hidden md:block">
            <div className="site-container py-12 sm:py-16">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Shop by category</h2>
                <Link href="/shop" className="text-sm font-medium text-teal">
                  View all products
                </Link>
              </div>
              <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/shop?category=${category.slug}`}
                    className="group rounded-2xl border border-navy/10 bg-white p-5 shadow-[0_8px_24px_rgba(22,52,76,0.04)] transition hover:-translate-y-1 hover:border-teal/30 hover:shadow-[0_16px_40px_rgba(22,52,76,0.08)] sm:p-8"
                  >
                    <CategoryGlyph slug={category.slug} />
                    <span className="mt-8 block text-lg font-semibold tracking-tight">{category.name}</span>
                    <span className="mt-2 block text-sm leading-6 text-navy">
                      {CATEGORY_BLURBS[category.slug] ?? "View products in this group."}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <ProductScrollRow products={products} />

      <section>
        <div className="site-container py-8 sm:py-12 md:py-16">
          <div className="hidden md:block">
            <Link href="/shop" className="group flex items-center gap-2">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Products in our shop</h2>
              <ChevronRight className="h-5 w-5 text-teal transition group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="product-grid mt-0 hidden md:grid md:mt-8">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-navy/10 bg-white">
        <div className="site-container py-10 sm:py-16">
          <h2 className="text-lg font-semibold tracking-tight text-navy/80">How to order</h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <li key={step.n}>
                <p className="text-xs font-medium tracking-[0.08em] text-teal">{step.n}</p>
                <p className="mt-2 text-base font-semibold tracking-tight">{step.title}</p>
                <p className="mt-1 text-sm leading-6 text-navy/75">{step.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-white">
        <div className="site-container grid gap-10 py-12 sm:gap-16 sm:py-16 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">A shop you can visit</h2>
            <p className="mt-8 font-medium">{BUSINESS.name}</p>
            <p className="mt-2 leading-7 text-navy">{BUSINESS.location}</p>
            <p className="mt-2 leading-7 text-navy">Near Afya Centre, in the building with Quickmart</p>
            <p className="mt-4 text-navy">{BUSINESS.phoneDisplay}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href={mapsUrl}
                className="inline-flex h-12 items-center rounded-xl bg-teal px-8 text-sm font-medium text-cream transition hover:bg-teal/90"
              >
                Get directions
              </a>
              <Link
                href="/contact"
                className="inline-flex h-12 items-center rounded-xl border border-navy/15 px-8 text-sm font-medium"
              >
                Contact us
              </Link>
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Delivery from Nairobi</h2>
            <p className="mt-8 leading-7 text-navy">
              We serve customers in Nairobi and arrange delivery to other parts of Kenya. Cost and
              timing depend on your location and order. We’ll confirm these details before payment.
            </p>
            <Link href="/delivery" className="mt-8 inline-flex h-12 items-center text-sm font-medium text-teal">
              View delivery information
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-navy/10">
        <div className="site-container flex flex-col gap-6 py-12 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-8 sm:py-16">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Buying for a clinic or business?</h2>
            <p className="mt-2 leading-7 text-navy">We also handle bulk orders.</p>
          </div>
          <Link
            href="/bulk-orders"
            className="inline-flex h-12 items-center rounded-xl border border-navy/15 px-8 text-sm font-medium"
          >
            Ask about bulk orders
          </Link>
        </div>
      </section>
    </>
  );
}
