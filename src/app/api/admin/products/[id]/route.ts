import { resolveProductCategory, resolveProductSubcategory } from "@/lib/category-resolve";
import { DomainError, correctStock, receiveStock } from "@/lib/operations";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const { id } = await context.params;
  const body = await request.json();
  const action = String(body.action ?? "");

  try {
    if (action === "update") {
      const name = String(body.name ?? "").trim();
      const shortDescription = String(body.shortDescription ?? "").trim();
      const isActive = Boolean(body.isActive);
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

      if (isActive) {
        const images = await prisma.productImage.count({ where: { productId: id } });
        if (images === 0) {
          return NextResponse.json(
            { error: "Add a photo before showing this product in the shop." },
            { status: 400 },
          );
        }
      }
      await prisma.product.update({
        where: { id },
        data: {
          name,
          shortDescription,
          description: String(body.description ?? "").trim() || null,
          unit: String(body.unit ?? "").trim() || "pack",
          stockUnit: String(body.stockUnit ?? "").trim() || "packs",
          priceKes: Math.max(0, Number(body.priceKes) || 0),
          isActive,
          featured: Boolean(body.featured),
          askForAvailability: Boolean(body.askForAvailability),
          reorderThreshold: Math.max(0, Number(body.reorderThreshold) || 0),
          categoryId: category.id,
          subcategoryId: subcategory?.id ?? null,
        },
      });
    } else if (action === "receive") {
      await receiveStock(id, Number(body.quantity) || 0, "Received stock");
    } else if (action === "correct") {
      const reason = String(body.reason ?? "").trim() || "Physical count";
      await correctStock(id, Number(body.countedQuantity) || 0, "Stock correction", reason);
    } else if (action === "delete-image") {
      await prisma.productImage.delete({
        where: { id: String(body.imageId ?? "") },
      });
    } else {
      return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof DomainError ? error.message : "Could not update the product.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
