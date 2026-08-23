import { ProductCard } from "@/components/store/ProductCard";
import { ShopFilters } from "@/components/store/ShopFilters";
import { prisma } from "@/lib/prisma";
import {
  activeCategory,
  activeSubcategory,
  priceBandsFrom,
  publishedProduct,
  shopOrderBy,
  shopWhere,
} from "@/lib/shop-query";

export const metadata = {
  title: "Shop",
  description:
    "Browse Velora medical supplies, check prices and submit your order request. We confirm availability before you pay.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    subcategory?: string;
    q?: string;
    availability?: string;
    price?: string;
    sort?: string;
  }>;
}) {
  const query = await searchParams;
  const { category, subcategory, q, availability, price, sort } = query;
  const [categories, products, publishedPrices] = await Promise.all([
    prisma.category.findMany({
      where: activeCategory,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        subcategories: {
          where: activeSubcategory,
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        },
      },
    }),
    prisma.product.findMany({
      where: shopWhere(query),
      orderBy: shopOrderBy(sort),
      include: { category: true, subcategory: true, images: true },
    }),
    prisma.product.findMany({
      where: publishedProduct,
      select: { priceKes: true },
    }),
  ]);
  const selectedParent = categories.find((item) => item.slug === category);
  const subcategories = selectedParent?.subcategories ?? [];
  const bands =
    publishedPrices.length >= 12
      ? priceBandsFrom(publishedPrices.map((item) => item.priceKes))
      : [];

  return (
    <div className="site-container page-py min-w-0">
      <h1 className="page-heading">Shop medical supplies</h1>
      <p className="mt-2 max-w-2xl text-navy/70">
        Search or filter, then add products to your order. We’ll confirm availability and delivery
        before you pay.
      </p>

      <ShopFilters
        categories={categories}
        subcategories={subcategories}
        bands={bands}
        query={{ category, subcategory, q, availability, price, sort }}
        productCount={products.length}
      />

      <div className="product-grid mt-8">
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
