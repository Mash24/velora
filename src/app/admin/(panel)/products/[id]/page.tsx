import { ProductEditor } from "@/components/admin/ProductEditor";
import {
  AdminBadge,
  AdminCard,
  AdminEmpty,
  AdminPageHeader,
  AdminTable,
  AdminTableHead,
} from "@/components/admin/ui";
import { formatAdminDateTime } from "@/lib/admin-period";
import { inventoryMovementLabel } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function AdminProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories, movements] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { images: true } }),
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { subcategories: { orderBy: [{ sortOrder: "asc" }, { name: "asc" }] } },
    }),
    prisma.inventoryMovement.findMany({
      where: { productId: id },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
  ]);
  if (!product) notFound();

  const history = movements.reduce<
    Array<(typeof movements)[number] & { balance: number }>
  >((rows, movement) => {
    const balance =
      rows.length === 0 ? product.stockQuantity : rows.at(-1)!.balance - rows.at(-1)!.quantity;
    return [...rows, { ...movement, balance }];
  }, []);

  return (
    <div className="max-w-2xl">
      <AdminPageHeader
        title={product.name}
        backHref="/admin/products"
        backLabel="Products"
        meta={
          <>
            On shelf: {product.stockQuantity} {product.stockUnit}
            {product.sku ? ` · Code ${product.sku}` : null}
          </>
        }
        actions={
          <AdminBadge tone={product.isActive ? "teal" : "coral"}>
            {product.isActive ? "In the shop" : "Hidden from customers"}
          </AdminBadge>
        }
      />

      <ProductEditor product={product} categories={categories} />

      <AdminCard
        title="Stock history"
        description="Why the system says this number is on the shelf."
        className="mt-8"
        padding="p-0"
      >
        {history.length === 0 ? (
          <AdminEmpty>No stock movements yet.</AdminEmpty>
        ) : (
          <AdminTable>
            <AdminTableHead>
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">What</th>
                <th className="px-4 py-3">Change</th>
                <th className="px-4 py-3">Balance</th>
              </tr>
            </AdminTableHead>
            <tbody>
              {history.map((row) => (
                <tr key={row.id} className="border-t border-navy/6">
                  <td className="px-4 py-3 text-navy/70">{formatAdminDateTime(row.createdAt)}</td>
                  <td className="px-4 py-3">
                    {inventoryMovementLabel(row.type)}
                    {row.reason ? (
                      <span className="block text-xs text-navy/45">{row.reason}</span>
                    ) : null}
                    {row.reference ? (
                      <span className="block text-xs text-navy/45">{row.reference}</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    <span className={row.quantity > 0 ? "text-teal" : "text-coral"}>
                      {row.quantity > 0 ? `+${row.quantity}` : row.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-navy/75">{row.balance}</td>
                </tr>
              ))}
            </tbody>
          </AdminTable>
        )}
      </AdminCard>
    </div>
  );
}
