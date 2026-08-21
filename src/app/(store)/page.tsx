import { ProductCard } from "@/components/store/ProductCard";
import { BUSINESS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { whatsappLink } from "@/lib/whatsapp";
import Link from "next/link";

export default async function HomePage() {
  const [featured, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, featured: true },
      orderBy: { name: "asc" },
      take: 6,
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <section className="bg-navy text-cream">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-teal">Nairobi · Nationwide</p>
            <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
              {BUSINESS.tagline}
            </h1>
            <p className="mt-4 max-w-lg text-cream/75">
              Find gloves, masks, equipment and everyday medical supplies, then order on WhatsApp.
              Nairobi riders can collect cash on delivery. Upcountry orders are paid before dispatch.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="rounded-full bg-cream px-5 py-3 text-sm font-medium text-navy">
                Browse products
              </Link>
              <a
                href={whatsappLink("Hi Velora, I need help finding a product.")}
                className="rounded-full bg-whatsapp px-5 py-3 text-sm font-medium text-white"
              >
                Order on WhatsApp
              </a>
            </div>
          </div>
          <div className="rounded-3xl bg-teal/20 p-6">
            <p className="text-sm uppercase tracking-[0.18em] text-cream/70">How it works</p>
            <ol className="mt-4 space-y-3 text-sm text-cream/90">
              <li>1. Find the product and price</li>
              <li>2. Send the order on WhatsApp</li>
              <li>3. Pay via M-Pesa</li>
              <li>4. We deliver in Nairobi or dispatch nationwide</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-teal">Catalogue</p>
            <h2 className="mt-2 text-2xl font-semibold">Popular supplies</h2>
          </div>
          <Link href="/shop" className="text-sm text-teal">
            View all
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>

      <section className="bg-sand">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-semibold">Shop by category</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/shop?category=${category.slug}`}
                className="rounded-2xl bg-white p-6 text-navy shadow-[0_10px_30px_rgba(18,50,74,0.04)]"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
