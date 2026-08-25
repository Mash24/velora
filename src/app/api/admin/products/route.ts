import { resolveProductCategory, resolveProductSubcategory } from "@/lib/category-resolve";
import { nextSku, slugify } from "@/lib/format";
import { receiveStock } from "@/lib/operations";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { revalidateStoreCatalog } from "@/lib/revalidate-store";
import { uploadProductImage } from "@/lib/storage";
import { NextResponse } from "next/server";

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function asImageFiles(form: FormData) {
  return form
    .getAll("file")
    .filter((item): item is File => item instanceof File && item.size > 0);
}

/**
 * Create a product in one request.
 * Accepts JSON (legacy) or multipart FormData with optional photos.
 * When showInShop is true and at least one photo is uploaded, the product goes live.
 */
export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const contentType = request.headers.get("content-type") ?? "";
  const isMultipart = contentType.includes("multipart/form-data");

  let name = "";
  let shortDescription = "";
  let description = "";
  let unit = "pack";
  let stockUnit = "packs";
  let priceKes = 0;
  let openingStock = 0;
  let reorderThreshold = 5;
  let askForAvailability = false;
  let showInShop = true;
  let featured = false;
  let categoryId = "";
  let categoryName = "";
  let subcategoryId: string | null = null;
  let subcategoryName = "";
  let files: File[] = [];

  if (isMultipart) {
    const form = await request.formData();
    name = String(form.get("name") ?? "").trim();
    shortDescription = String(form.get("shortDescription") ?? "").trim();
    description = String(form.get("description") ?? "").trim();
    unit = String(form.get("unit") ?? "").trim() || "pack";
    stockUnit = String(form.get("stockUnit") ?? "").trim() || "packs";
    priceKes = Math.max(0, Number(form.get("priceKes")) || 0);
    openingStock = Math.max(0, Math.floor(Number(form.get("openingStock")) || 0));
    reorderThreshold = Math.max(0, Number(form.get("reorderThreshold") || 5));
    askForAvailability = form.get("askForAvailability") === "on" || form.get("askForAvailability") === "true";
    showInShop = form.get("showInShop") === "on" || form.get("showInShop") === "true";
    featured = form.get("featured") === "on" || form.get("featured") === "true";
    categoryId = String(form.get("categoryId") ?? "");
    categoryName = String(form.get("categoryName") ?? "");
    subcategoryId = String(form.get("subcategoryId") ?? "") || null;
    subcategoryName = String(form.get("subcategoryName") ?? "");
    files = asImageFiles(form);
  } else {
    const body = await request.json();
    name = String(body.name ?? "").trim();
    shortDescription = String(body.shortDescription ?? "").trim();
    description = String(body.description ?? "").trim();
    unit = String(body.unit ?? "").trim() || "pack";
    stockUnit = String(body.stockUnit ?? "").trim() || "packs";
    priceKes = Math.max(0, Number(body.priceKes) || 0);
    openingStock = Math.max(0, Math.floor(Number(body.openingStock) || 0));
    reorderThreshold = Math.max(0, Number(body.reorderThreshold) || 5);
    askForAvailability = Boolean(body.askForAvailability);
    showInShop = body.showInShop !== false;
    featured = Boolean(body.featured);
    categoryId = String(body.categoryId ?? "");
    categoryName = String(body.categoryName ?? "");
    subcategoryId = String(body.subcategoryId ?? "") || null;
    subcategoryName = String(body.subcategoryName ?? "");
  }

  if (!name) {
    return NextResponse.json({ error: "Please enter the product name." }, { status: 400 });
  }

  const summary = shortDescription || name;

  if (showInShop && files.length === 0) {
    return NextResponse.json(
      { error: "Add a product photo before publishing on the website." },
      { status: 400 },
    );
  }

  for (const file of files) {
    if (file.size > 6 * 1024 * 1024) {
      return NextResponse.json({ error: "Please use photos smaller than 6 MB." }, { status: 400 });
    }
    if (file.type && !imageTypes.has(file.type)) {
      return NextResponse.json({ error: "Please use JPG, PNG or WebP photos." }, { status: 400 });
    }
  }

  let category;
  try {
    category = await resolveProductCategory({ categoryId, categoryName });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "CATEGORY_REQUIRED") {
      return NextResponse.json({ error: "Please choose a category." }, { status: 400 });
    }
    return NextResponse.json({ error: "That category was not found." }, { status: 400 });
  }

  let subcategory;
  try {
    subcategory = await resolveProductSubcategory(category.id, {
      subcategoryId,
      subcategoryName,
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

  const wantLive = showInShop && files.length > 0;

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      sku: nextSku(count),
      shortDescription: summary,
      description: description || null,
      unit,
      stockUnit,
      priceKes,
      stockQuantity: 0,
      reorderThreshold,
      askForAvailability,
      categoryId: category.id,
      subcategoryId: subcategory?.id ?? null,
      isActive: wantLive,
      featured: wantLive && featured,
    },
  });

  if (openingStock > 0) {
    await receiveStock(product.id, openingStock, "Initial stock");
  }

  try {
    for (const file of files) {
      const url = await uploadProductImage(file, product.id);
      await prisma.productImage.create({
        data: { productId: product.id, url, alt: product.name },
      });
    }
  } catch {
    return NextResponse.json(
      {
        id: product.id,
        error: "Product was saved, but a photo failed to upload. Open it and try the photo again.",
        partial: true,
      },
      { status: 400 },
    );
  }

  revalidateStoreCatalog();
  return NextResponse.json({
    id: product.id,
    live: wantLive,
  });
}
