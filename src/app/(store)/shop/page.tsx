import { ProductCard } from "@/components/store/ProductCard";
import { ShopFilters } from "@/components/store/ShopFilters";
import { prisma } from "@/lib/prisma";
import { priceBandsFrom, shopOrderBy, shopWhere } from "@/lib/shop-query";
import {
  getPublishedPrices,
  getShopFilterCategories,
  productCardSelect,
} from "@/lib/store-data";

export const metadata = {
  title: "Shop",
  description:
    "Browse Velora medical supplies from our Nairobi shop, with delivery across Kenya.",
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
    getShopFilterCategories(),
    prisma.product.findMany({
      where: shopWhere(query),
      orderBy: shopOrderBy(sort),
      select: productCardSelect,
    }),
    getPublishedPrices(),
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
        Search or filter, then add products to your order.
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
