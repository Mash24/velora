import { slugify } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { revalidateStoreCatalog } from "@/lib/revalidate-store";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const body = await request.json();
  const name = String(body.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "Please enter a name." }, { status: 400 });
  }

  const parentId = String(body.parentId ?? "") || null;
  const slugBase = slugify(name) || "item";

  if (parentId) {
    const parent = await prisma.category.findUnique({ where: { id: parentId } });
    if (!parent) {
      return NextResponse.json({ error: "That category was not found." }, { status: 400 });
    }
    await prisma.subcategory.create({
      data: {
        name,
        slug: `${slugBase}-${Date.now().toString(36)}`,
        categoryId: parentId,
      },
    });
    revalidateStoreCatalog();
    return NextResponse.json({ ok: true });
  }

  await prisma.category.create({
    data: { name, slug: `${slugBase}-${Date.now().toString(36)}` },
  });
  revalidateStoreCatalog();
  return NextResponse.json({ ok: true });
}
