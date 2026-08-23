import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { publishedProduct } from "@/lib/shop-query";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://velora-brown-tau.vercel.app";
  const products = await prisma.product.findMany({
    where: publishedProduct,
    select: { slug: true, updatedAt: true },
  });
  return [
    "",
    "/shop",
    "/about",
    "/contact",
    "/delivery",
    "/bulk-orders",
    ...products.map((product) => `/product/${product.slug}`),
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: path.startsWith("/product/")
      ? products.find((product) => `/product/${product.slug}` === path)?.updatedAt
      : new Date(),
  }));
}
