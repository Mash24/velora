import { ProductCard } from "@/components/store/ProductCard";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Shop" };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      ...(category ? { category: { slug: category } } : {}),
    },
    orderBy: { name: "asc" },
    include: { category: true },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Shop medical supplies</h1>
      <p className="mt-2 max-w-2xl text-navy/70">
        Search the catalogue, check availability, then order on WhatsApp. Prices can be confirmed
        before payment.
      </p>
      <form className="mt-6 flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search nitrile gloves, masks..."
          className="min-w-64 flex-1 rounded-full border border-navy/15 bg-white px-4 py-2"
        />
        <select
          name="category"
          defaultValue={category}
          className="rounded-full border border-navy/15 bg-white px-4 py-2"
        >
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
        <button className="rounded-full bg-navy px-5 py-2 text-sm text-cream">Search</button>
      </form>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
      {products.length === 0 ? (
        <p className="mt-10 text-navy/70">No products matched that search yet.</p>
      ) : null}
    </div>
  );
}
