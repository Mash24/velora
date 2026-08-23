import { CategoryManager } from "@/components/admin/CategoryManager";
import { AdminPageHeader } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { products: true } },
      subcategories: {
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        include: { _count: { select: { products: true } } },
      },
    },
  });

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        description="The master list for Velora’s non-pharmaceutical supplies. Hide a group instead of deleting it if it has products."
      />
      <CategoryManager categories={categories} />
    </div>
  );
}
