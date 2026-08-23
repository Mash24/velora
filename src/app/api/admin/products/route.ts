import { resolveProductCategory, resolveProductSubcategory } from "@/lib/category-resolve";
import { nextSku, slugify } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const shortDescription = String(body.shortDescription ?? "").trim();
  if (!name || !shortDescription) {
    return NextResponse.json(
      { error: "Please enter the product name and one-sentence description." },
      { status: 400 },
    );
  }

  let category;
  try {
    category = await resolveProductCategory({
      categoryId: String(body.categoryId ?? ""),
      categoryName: String(body.categoryName ?? ""),
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "CATEGORY_REQUIRED") {
      return NextResponse.json({ error: "Please choose or type a category." }, { status: 400 });
    }
    return NextResponse.json({ error: "That category was not found." }, { status: 400 });
  }

  let subcategory;
  try {
    subcategory = await resolveProductSubcategory(category.id, {
      subcategoryId: String(body.subcategoryId ?? "") || null,
      subcategoryName: String(body.subcategoryName ?? ""),
    });
  } catch {
    return NextResponse.json(
      { error: "That subcategory does not belong to the chosen category." },
      { status: 400 },
    );
  }

  const count = await prisma.product.count();
  let slug = slugify(name) || `product-${Date.now().toString(36)}`;
  const slugTaken = await prisma.product.findUnique({ where: { slug } });
  if (slugTaken) slug = `${slug}-${Date.now().toString(36)}`;
  const product = await prisma.product.create({
    data: {
      name,
      slug,
      sku: nextSku(count),
      shortDescription,
      description: String(body.description ?? "").trim() || null,
      unit: String(body.unit ?? "").trim() || "pack",
      stockUnit: String(body.stockUnit ?? "").trim() || "packs",
      priceKes: Math.max(0, Number(body.priceKes) || 0),
      stockQuantity: 0,
      reorderThreshold: Math.max(0, Number(body.reorderThreshold) || 5),
      askForAvailability: Boolean(body.askForAvailability),
      categoryId: category.id,
      subcategoryId: subcategory?.id ?? null,
      isActive: false,
      featured: Boolean(body.featured),
    },
  });
  return NextResponse.json({ id: product.id });
}
