import { prisma } from "@/lib/prisma";
import {
  activeCategory,
  activeSubcategory,
  categoryWithPublishedProducts,
  publishedProduct,
} from "@/lib/shop-query";
import { unstable_cache } from "next/cache";
import { cache } from "react";

const productCardSelect = {
  id: true,
  name: true,
  slug: true,
  priceKes: true,
  unit: true,
  stockQuantity: true,
  askForAvailability: true,
  images: {
    take: 1,
    orderBy: { id: "asc" as const },
    select: { url: true, alt: true },
  },
} as const;

/** Header category chips — shared across every storefront page. */
export const getNavCategories = unstable_cache(
  async () =>
    prisma.category.findMany({
      where: categoryWithPublishedProducts,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true },
    }),
  ["store-nav-categories"],
  { revalidate: 60, tags: ["catalog", "categories"] },
);

/** Homepage best sellers. */
export const getHomeProducts = unstable_cache(
  async () =>
    prisma.product.findMany({
      where: publishedProduct,
      orderBy: [{ featured: "desc" }, { name: "asc" }],
      take: 8,
      select: productCardSelect,
    }),
  ["store-home-products"],
  { revalidate: 30, tags: ["catalog", "products"] },
);

/** Shop filter sidebar categories + subcategories. */
export const getShopFilterCategories = unstable_cache(
  async () =>
    prisma.category.findMany({
      where: activeCategory,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        subcategories: {
          where: activeSubcategory,
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          select: { id: true, name: true, slug: true, isActive: true },
        },
      },
    }),
  ["store-shop-categories"],
  { revalidate: 60, tags: ["catalog", "categories"] },
);

/** All published prices for shop price bands. */
export const getPublishedPrices = unstable_cache(
  async () =>
    prisma.product.findMany({
      where: publishedProduct,
      select: { priceKes: true },
    }),
  ["store-published-prices"],
  { revalidate: 60, tags: ["catalog", "products"] },
);

/** Dedupes generateMetadata + page in the same request. */
export const getPublishedProductBySlug = cache(async (slug: string) =>
  prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      subcategory: true,
      images: { orderBy: { id: "asc" } },
    },
  }),
);

export { productCardSelect };
