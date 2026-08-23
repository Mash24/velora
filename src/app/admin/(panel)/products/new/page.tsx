import { NewProductForm } from "@/components/admin/NewProductForm";
import { AdminPageHeader } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { subcategories: { orderBy: [{ sortOrder: "asc" }, { name: "asc" }] } },
  });
  return (
    <div className="max-w-xl">
      <AdminPageHeader
        title="Add product"
        description="Choose from the full Velora category list, or type a new category if it is not there yet. The product stays hidden until you add a photo and show it in the shop."
        meta={
          <Link href="/velora-product-list.csv" className="font-medium text-teal">
            Download the product list template →
          </Link>
        }
      />
      <NewProductForm categories={categories} />
    </div>
  );
}
