import { RecordSaleForm } from "@/components/admin/RecordSaleForm";
import { AdminNotice, AdminPageHeader } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";

export default async function RecordSalePage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, priceKes: true, stockQuantity: true },
  });

  return (
    <div className="max-w-xl">
      <AdminPageHeader
        title="Record sale"
        description="Use this for a walk-in, a phone call, or a WhatsApp chat that did not start on the website. Confirming deducts stock immediately."
      />
      {products.length === 0 ? (
        <AdminNotice tone="warn">Add products first before recording a sale.</AdminNotice>
      ) : (
        <RecordSaleForm products={products} />
      )}
    </div>
  );
}
