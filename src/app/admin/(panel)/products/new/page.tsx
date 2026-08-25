import { NewProductForm } from "@/components/admin/NewProductForm";
import { AdminPageHeader } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { subcategories: { orderBy: [{ sortOrder: "asc" }, { name: "asc" }] } },
  });
  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        title="Add product"
        description="Build the catalogue entry. Publish when the photo looks right."
        backHref="/admin/products"
        backLabel="Products"
      />
      <NewProductForm categories={categories} />
    </div>
  );
}
