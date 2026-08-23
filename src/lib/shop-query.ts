import { Prisma } from "@prisma/client";

export type ShopQuery = {
  q?: string;
  category?: string;
  subcategory?: string;
  availability?: string;
  price?: string;
  sort?: string;
};

export const publishedProduct: Prisma.ProductWhereInput = {
  isActive: true,
  category: { isActive: true },
  OR: [{ subcategoryId: null }, { subcategory: { isActive: true } }],
};

export function shopWhere(query: ShopQuery): Prisma.ProductWhereInput {
  const and: Prisma.ProductWhereInput[] = [publishedProduct];

  if (query.subcategory && query.category) {
    and.push({
      category: { slug: query.category, isActive: true },
      subcategory: { slug: query.subcategory, isActive: true },
    });
  } else if (query.category) {
    and.push({ category: { slug: query.category, isActive: true } });
  }

  if (query.q?.trim()) {
    const q = query.q.trim();
    and.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { sku: { contains: q, mode: "insensitive" } },
        { shortDescription: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { category: { name: { contains: q, mode: "insensitive" } } },
        { subcategory: { name: { contains: q, mode: "insensitive" } } },
      ],
    });
  }

  if (query.availability === "in") {
    and.push({ askForAvailability: false, stockQuantity: { gt: 0 } });
  } else if (query.availability === "out") {
    and.push({ askForAvailability: false, stockQuantity: { lte: 0 } });
  } else if (query.availability === "ask") {
    and.push({ askForAvailability: true });
  }

  if (query.price === "under-500") and.push({ priceKes: { lt: 500 } });
  if (query.price === "500-1000") and.push({ priceKes: { gte: 500, lt: 1000 } });
  if (query.price === "1000-5000") and.push({ priceKes: { gte: 1000, lt: 5000 } });
  if (query.price === "5000-plus") and.push({ priceKes: { gte: 5000 } });

  return { AND: and };
}

export function shopOrderBy(sort?: string): Prisma.ProductOrderByWithRelationInput {
  if (sort === "price-asc") return { priceKes: "asc" };
  if (sort === "price-desc") return { priceKes: "desc" };
  if (sort === "newest") return { createdAt: "desc" };
  return { name: "asc" };
}

export function priceBandsFrom(prices: number[]) {
  const bands = [
    { value: "under-500", label: "Under KSh 500", match: (n: number) => n < 500 },
    { value: "500-1000", label: "KSh 500–1,000", match: (n: number) => n >= 500 && n < 1000 },
    { value: "1000-5000", label: "KSh 1,000–5,000", match: (n: number) => n >= 1000 && n < 5000 },
    { value: "5000-plus", label: "KSh 5,000+", match: (n: number) => n >= 5000 },
  ];
  return bands.filter((band) => prices.some(band.match));
}

export const activeCategory: Prisma.CategoryWhereInput = {
  isActive: true,
};

export const activeSubcategory: Prisma.SubcategoryWhereInput = {
  isActive: true,
};

export const categoryWithPublishedProducts: Prisma.CategoryWhereInput = {
  isActive: true,
  products: {
    some: {
      isActive: true,
      OR: [{ subcategoryId: null }, { subcategory: { isActive: true } }],
    },
  },
};

export const subcategoryWithPublishedProducts: Prisma.SubcategoryWhereInput = {
  isActive: true,
  products: { some: { isActive: true } },
};
