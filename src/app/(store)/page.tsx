import { CategoryGlyph } from "@/components/store/CategoryGlyph";
import { DeliveryEstimator } from "@/components/store/DeliveryEstimator";
import { HomeHero } from "@/components/store/HomeHero";
import { ProductCard } from "@/components/store/ProductCard";
import { BUSINESS, MAPS_EMBED_URL, MAPS_SEARCH_URL } from "@/lib/constants";
import { CATEGORY_BLURBS } from "@/lib/category-blurbs";
import { prisma } from "@/lib/prisma";
import { categoryWithPublishedProducts, publishedProduct } from "@/lib/shop-query";
import { parseSource } from "@/lib/source";
import Link from "next/link";

const faqs = [
  {
    q: "Do you ship outside Nairobi?",
    a: "Yes. We deliver in Nairobi and arrange courier delivery to other parts of Kenya. Cost and timing depend on your town and the size of the order.",
  },
  {
    q: "How do I pay?",
    a: "M-Pesa, cash, or pay on delivery. We’ll share the total and payment option when we process your order.",
  },
  {
    q: "Can I pick up from the shop?",
    a: "Yes. Choose pickup at checkout. The shop is at Travis House, 3rd Floor, Shop A6, Mfangano Street, Nairobi — near Afya Centre, in the building with Quickmart.",
  },
  {
    q: "Do you take clinic or bulk orders?",
    a: "Yes. Add the products you need and note that it is a bulk or institutional order, or use the bulk-orders page.",
  },
];

const valueProps = [
  {
    title: "Nairobi & countrywide",
    detail: "Order from the CBD shop, with delivery arranged across Kenya.",
  },
  {
    title: "Genuine supplies",
    detail: "Medical products for home care, clinics and facilities.",
  },
  {
    title: "M-Pesa, cash & delivery",
    detail: "Pay with M-Pesa, cash, or pay on delivery.",
  },
  {
    title: "Bulk for clinics",
    detail: "Larger quantities for labs, offices and healthcare buyers.",
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
      take: 8,
      include: { images: true },
    }),
    prisma.category.findMany({
      where: categoryWithPublishedProducts,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  ]);

  return (
    <>
      <HomeHero fromTiktok={fromTiktok} />

      <section className="bg-white">
        <div className="site-container grid gap-6 py-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 lg:py-10">
          {valueProps.map((item) => (
            <div key={item.title}>
              <p className="font-semibold tracking-tight text-navy">{item.title}</p>
              <p className="mt-1.5 text-sm leading-6 text-navy/70">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {categories.length > 0 ? (
        <section id="categories" className="scroll-mt-28 md:scroll-mt-32">
          <div className="site-container py-10 sm:py-14">
            <div className="flex items-end justify-between gap-4">
              <h2 className="section-heading">Shop by category</h2>
              <Link href="/shop" className="shrink-0 text-sm font-semibold text-teal">
                View all
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/shop?category=${category.slug}`}
                  className="rounded-2xl border border-navy/10 bg-white p-4 shadow-[0_8px_24px_rgba(22,52,76,0.04)] transition hover:-translate-y-0.5 hover:border-teal/30 sm:p-6"
                >
                  <CategoryGlyph slug={category.slug} />
                  <span className="mt-4 block text-sm font-semibold tracking-tight sm:text-base">
                    {category.name}
                  </span>
                  <span className="mt-1 hidden text-sm leading-6 text-navy/70 sm:block">
                    {CATEGORY_BLURBS[category.slug] ?? "View products in this group."}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {products.length > 0 ? (
        <section className="bg-white">
          <div className="site-container py-10 sm:py-14">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="section-heading">Best sellers</h2>
                <p className="mt-1 text-sm text-navy/70">Prices in KES. Stock shown from the Nairobi shop.</p>
              </div>
              <Link href="/shop" className="shrink-0 text-sm font-semibold text-teal">
                Shop all
              </Link>
            </div>
            <div className="product-grid mt-6">
              {products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-y border-navy/10">
        <div className="site-container grid gap-8 py-10 sm:py-14 lg:grid-cols-2">
          <div>
            <h2 className="section-heading">Visit the Nairobi shop</h2>
            <p className="mt-3 font-medium">{BUSINESS.name}</p>
            <p className="mt-2 leading-7 text-navy">{BUSINESS.location}</p>
            <p className="leading-7 text-navy">{BUSINESS.landmark}</p>
            <p className="mt-3 text-navy">{BUSINESS.phoneDisplay}</p>
            <p className="mt-4 text-sm leading-6 text-navy/75">
              Visit the shop to see products, collect an order, or pay in person.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={MAPS_SEARCH_URL}
                className="inline-flex h-12 items-center rounded-xl bg-teal px-6 text-sm font-semibold text-cream"
              >
                Get directions
              </a>
              <Link
                href="/contact"
                className="inline-flex h-12 items-center rounded-xl border border-navy/15 px-6 text-sm font-semibold"
              >
                Contact us
              </Link>
            </div>
            <iframe
              title="Velora shop on Google Maps"
              src={MAPS_EMBED_URL}
              className="mt-6 h-56 w-full rounded-2xl border-0 ring-1 ring-navy/10 sm:h-72"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <DeliveryEstimator />
        </div>
      </section>

      <section>
        <div className="site-container py-10 sm:py-14">
          <h2 className="section-heading">Questions, answered</h2>
          <div className="mt-6 divide-y divide-navy/10 rounded-2xl border border-navy/10 bg-white">
            {faqs.map((item) => (
              <details key={item.q} className="group px-5 py-2">
                <summary className="cursor-pointer list-none py-3 font-semibold tracking-tight [&::-webkit-details-marker]:hidden">
                  {item.q}
                </summary>
                <p className="pb-4 text-sm leading-6 text-navy/75">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
