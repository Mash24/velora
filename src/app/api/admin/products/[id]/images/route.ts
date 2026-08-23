import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { uploadProductImage } from "@/lib/storage";
import { NextResponse } from "next/server";

const types = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const { id } = await context.params;
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Please choose a photo." }, { status: 400 });
  }
  if (file.size > 6 * 1024 * 1024) {
    return NextResponse.json({ error: "Please use a photo smaller than 6 MB." }, { status: 400 });
  }
  if (file.type && !types.has(file.type)) {
    return NextResponse.json({ error: "Please use a JPG, PNG or WebP photo." }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  try {
    const url = await uploadProductImage(file, id);
    await prisma.productImage.create({
      data: { productId: id, url, alt: product.name },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Could not upload the photo. Try again, or use a smaller JPG/PNG." },
      { status: 400 },
    );
  }
}
