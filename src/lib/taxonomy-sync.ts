import { MASTER_TAXONOMY, subcategorySlug } from "../../prisma/taxonomy";
import { prisma } from "./prisma";

/** Upsert Wendy's full category list from prisma/taxonomy.ts into the database. */
export async function syncMasterTaxonomy() {
  const categoryIds = new Map<string, string>();
  for (const [index, item] of MASTER_TAXONOMY.entries()) {
    const category = await prisma.category.upsert({
      where: { slug: item.slug },
      update: { name: item.name, isActive: item.isActive, sortOrder: index },
      create: { name: item.name, slug: item.slug, isActive: item.isActive, sortOrder: index },
    });
    categoryIds.set(item.slug, category.id);

    for (const [subIndex, name] of item.subcategories.entries()) {
      const slug = subcategorySlug(name);
      await prisma.subcategory.upsert({
        where: { categoryId_slug: { categoryId: category.id, slug } },
        update: { name, isActive: item.isActive, sortOrder: subIndex },
        create: { name, slug, categoryId: category.id, isActive: item.isActive, sortOrder: subIndex },
      });
    }
  }
  return categoryIds;
}
