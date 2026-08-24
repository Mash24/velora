import { prisma } from "@/lib/prisma";
import { shopWhere } from "@/lib/shop-query";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ products: [] });
  }

  const products = await prisma.product.findMany({
    where: shopWhere({ q }),
    orderBy: { name: "asc" },
    take: 8,
    select: {
      name: true,
      slug: true,
      priceKes: true,
      unit: true,
    },
  });

  return NextResponse.json({ products });
}
