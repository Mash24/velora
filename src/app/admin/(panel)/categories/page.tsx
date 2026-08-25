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

  const subCount = categories.reduce((sum, item) => sum + item.subcategories.length, 0);

  return (
    <div className="min-w-0">
      <AdminPageHeader
        title="Categories"
        description="Groups for the shop. Hide instead of deleting if products still use them."
        meta={
          <span>
            {categories.length} categor{categories.length === 1 ? "y" : "ies"}
            {subCount > 0 ? ` · ${subCount} subcategories` : ""}
          </span>
        }
      />
      <CategoryManager categories={categories} />
    </div>
  );
}
