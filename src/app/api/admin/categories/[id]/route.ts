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
  const type = String(body.type ?? "category");

  if (type === "subcategory") {
    const subcategory = await prisma.subcategory.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!subcategory) return NextResponse.json({ error: "Not found." }, { status: 404 });
    if (action === "hide") {
      await prisma.subcategory.update({ where: { id }, data: { isActive: false } });
    } else if (action === "show") {
      await prisma.subcategory.update({ where: { id }, data: { isActive: true } });
    } else if (action === "delete") {
      if (subcategory._count.products > 0) {
        return NextResponse.json(
          { error: "This subcategory has products. Hide it instead of deleting." },
          { status: 400 },
        );
      }
      await prisma.subcategory.delete({ where: { id } });
    } else {
      return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  }

  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true, subcategories: true } } },
  });
  if (!category) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (action === "hide") {
    await prisma.category.update({ where: { id }, data: { isActive: false } });
  } else if (action === "show") {
    await prisma.category.update({ where: { id }, data: { isActive: true } });
  } else if (action === "delete") {
    if (category._count.products > 0 || category._count.subcategories > 0) {
      return NextResponse.json(
        { error: "This category still has products or subcategories. Hide it instead of deleting." },
        { status: 400 },
      );
    }
    await prisma.category.delete({ where: { id } });
  } else {
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
