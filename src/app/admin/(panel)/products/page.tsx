import { AdminProductsMobileList } from "@/components/admin/AdminMobileLists";
import {
  AdminBadge,
  AdminButtonLink,
  AdminCard,
  AdminEmpty,
  AdminPageHeader,
  AdminTable,
  AdminTableHead,
} from "@/components/admin/ui";
import { formatKes } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true, subcategory: true },
    orderBy: { name: "asc" },
  });

  const mobileItems = products.map((product) => ({
    id: product.id,
    name: product.name,
    categoryLabel: `${product.category.name}${product.subcategory ? ` → ${product.subcategory.name}` : ""}`,
    priceLabel: formatKes(product.priceKes),
    stockLabel: `${product.stockQuantity} ${product.stockUnit}`,
    visible: product.isActive,
  }));

  return (
    <div className="min-w-0">
      <AdminPageHeader
        title="Products"
        description="Stock numbers are for you only. Customers see In stock, Out of stock, or Ask us."
        actions={<AdminButtonLink href="/admin/products/new">Add product</AdminButtonLink>}
      />

      <AdminCard padding="p-0">
        {products.length === 0 ? (
          <AdminEmpty>No products yet.</AdminEmpty>
        ) : (
          <>
            <AdminProductsMobileList products={mobileItems} />
            <div className="admin-table-desktop admin-table-wrap">
              <AdminTable>
                <AdminTableHead>
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Visible</th>
                  </tr>
                </AdminTableHead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-t border-navy/6 transition hover:bg-sand/20">
                      <td className="px-4 py-3.5">
                        <Link href={`/admin/products/${product.id}`} className="break-anywhere font-semibold text-teal">
                          {product.name}
                        </Link>
                        <div className="break-anywhere text-xs text-navy/50">
                          {product.category.name}
                          {product.subcategory ? ` → ${product.subcategory.name}` : ""}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 tabular-nums">{formatKes(product.priceKes)}</td>
                      <td className="px-4 py-3.5 tabular-nums">
                        {product.stockQuantity} {product.stockUnit}
                      </td>
                      <td className="px-4 py-3.5">
                        <AdminBadge tone={product.isActive ? "teal" : "neutral"}>
                          {product.isActive ? "In the shop" : "Hidden"}
                        </AdminBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </AdminTable>
            </div>
          </>
        )}
      </AdminCard>
    </div>
  );
}
