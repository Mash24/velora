import { Prisma } from "@prisma/client";
import { subcategorySlug } from "../../prisma/taxonomy";
import { slugify } from "./format";
import { prisma } from "./prisma";

type Db = Prisma.TransactionClient | typeof prisma;

export async function findOrCreateCategory(name: string, db: Db = prisma) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("CATEGORY_NAME_REQUIRED");

  const slug = slugify(trimmed);
  const existing = await db.category.findFirst({
    where: {
      OR: [{ slug }, { name: { equals: trimmed, mode: "insensitive" } }],
    },
  });
  if (existing) return existing;

  return db.category.create({
    data: {
      name: trimmed,
      slug: `${slug || "category"}-${Date.now().toString(36)}`,
      isActive: true,
    },
  });
}

export async function findOrCreateSubcategory(categoryId: string, name: string, db: Db = prisma) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("SUBCATEGORY_NAME_REQUIRED");

  const slug = subcategorySlug(trimmed);
  const existing = await db.subcategory.findFirst({
    where: {
      categoryId,
      OR: [{ slug }, { name: { equals: trimmed, mode: "insensitive" } }],
    },
  });
  if (existing) return existing;

  const count = await db.subcategory.count({ where: { categoryId } });
  return db.subcategory.create({
    data: {
      name: trimmed,
      slug: `${slug || "subcategory"}-${Date.now().toString(36)}`,
      categoryId,
      isActive: true,
      sortOrder: count,
    },
  });
}

export async function resolveProductCategory(input: {
  categoryId?: string;
  categoryName?: string;
}) {
  if (input.categoryName?.trim()) {
    return findOrCreateCategory(input.categoryName);
  }
  if (!input.categoryId) throw new Error("CATEGORY_REQUIRED");
  const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
  if (!category) throw new Error("CATEGORY_NOT_FOUND");
  return category;
}

export async function resolveProductSubcategory(
  categoryId: string,
  input: { subcategoryId?: string | null; subcategoryName?: string },
) {
  if (input.subcategoryName?.trim()) {
    return findOrCreateSubcategory(categoryId, input.subcategoryName);
  }
  if (!input.subcategoryId) return null;
  const sub = await prisma.subcategory.findFirst({
    where: { id: input.subcategoryId, categoryId },
  });
  if (!sub) throw new Error("SUBCATEGORY_NOT_FOUND");
  return sub;
}
