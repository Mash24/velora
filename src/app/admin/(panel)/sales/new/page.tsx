import { RecordSaleForm } from "@/components/admin/RecordSaleForm";
import { AdminButtonLink, AdminNotice, AdminPageHeader } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function RecordSalePage() {
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      priceKes: true,
      stockQuantity: true,
      stockUnit: true,
      isActive: true,
    },
  });

  return (
    <div className="mx-auto max-w-xl">
      <AdminPageHeader
        title="Record a sale"
        description="Walk-in, phone, or WhatsApp — stock comes off the shelf when you save."
        backHref="/admin/orders"
        backLabel="Orders"
      />
      {products.length === 0 ? (
        <AdminNotice tone="warn">
          Add a product first.{" "}
          <Link href="/admin/products/new" className="font-semibold text-teal">
            Add product →
          </Link>
        </AdminNotice>
      ) : (
        <RecordSaleForm products={products} />
      )}
      {products.length === 0 ? (
        <div className="mt-4">
          <AdminButtonLink href="/admin/products/new">Add a product</AdminButtonLink>
        </div>
      ) : null}
    </div>
  );
}
