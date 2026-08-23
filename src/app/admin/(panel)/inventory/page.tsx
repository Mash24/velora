import { AdminInventoryMobileList } from "@/components/admin/AdminMobileLists";
import {
  AdminBadge,
  AdminCard,
  AdminEmpty,
  AdminFilterPill,
  AdminPageHeader,
  AdminSectionTitle,
  AdminStatCard,
  AdminTable,
  AdminTableHead,
  adminButtonClass,
  adminInputClass,
} from "@/components/admin/ui";
import { isLowStock } from "@/lib/admin-filters";
import { formatAdminDateTime } from "@/lib/admin-period";
import { inventoryMovementLabel } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; stock?: string; category?: string }>;
}) {
  const { q, stock, category } = await searchParams;
  const products = await prisma.product.findMany({
    where: {
      ...(q?.trim()
        ? { name: { contains: q.trim(), mode: "insensitive" } }
        : {}),
      ...(category ? { category: { slug: category } } : {}),
    },
    include: {
      category: true,
      movements: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { name: "asc" },
  });
  const low = products.filter(isLowStock);
  const out = products.filter((product) => product.stockQuantity <= 0);
  const visible =
    stock === "low" ? low : stock === "out" ? out : products;

  const mobileItems = visible.map((product) => {
    const status =
      product.stockQuantity <= 0 ? "Out" : isLowStock(product) ? "Low" : "OK";
    const last = product.movements[0];
    return {
      id: product.id,
      name: product.name,
      categoryName: product.category.name,
      stockQuantity: product.stockQuantity,
      stockUnit: product.stockUnit,
      reorderThreshold: product.reorderThreshold,
      status,
      statusTone: (status === "Out" ? "coral" : status === "Low" ? "sand" : "teal") as
        | "teal"
        | "sand"
        | "coral",
      lastMovement: last ? (
        <>
          {inventoryMovementLabel(last.type)}
          {last.reason ? ` · ${last.reason}` : null}
          <span className="block">{formatAdminDateTime(last.createdAt)}</span>
        </>
      ) : (
        "—"
      ),
    };
  });

  return (
    <div className="min-w-0">
      <AdminPageHeader
        title="Inventory"
        description="The number on the shelf. Receive or correct stock from the product — never type over it silently."
      />

      <section className="mb-8">
        <AdminSectionTitle>Overview</AdminSectionTitle>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AdminStatCard
            label="Products"
            value={products.length}
            hint="All items in the catalogue"
            href="/admin/inventory"
          />
          <AdminStatCard
            label="Low stock"
            value={low.length}
            hint={low.length ? "At or below reorder threshold" : "All levels healthy"}
            href="/admin/inventory?stock=low"
            warn={low.length > 0}
          />
          <AdminStatCard
            label="Out of stock"
            value={out.length}
            hint={out.length ? "Needs restocking" : "Nothing empty right now"}
            href="/admin/inventory?stock=out"
            warn={out.length > 0}
          />
        </div>
      </section>

      <div className="mb-4 flex flex-wrap gap-2">
        <AdminFilterPill href="/admin/inventory" active={!stock}>
          All
        </AdminFilterPill>
        <AdminFilterPill href="/admin/inventory?stock=low" active={stock === "low"}>
          Low stock
        </AdminFilterPill>
        <AdminFilterPill href="/admin/inventory?stock=out" active={stock === "out"}>
          Out of stock
        </AdminFilterPill>
      </div>

      <form className="mb-6 flex min-w-0 flex-col gap-3 sm:flex-row" action="/admin/inventory">
        {stock ? <input type="hidden" name="stock" value={stock} /> : null}
        <input
          name="q"
          defaultValue={q}
          placeholder="Search products…"
          className={`${adminInputClass} min-w-0 flex-1`}
        />
        <button type="submit" className={`${adminButtonClass("primary")} sm:shrink-0`}>
          Search
        </button>
      </form>

      <AdminCard padding="p-0">
        {visible.length === 0 ? (
          <AdminEmpty>No products match that view.</AdminEmpty>
        ) : (
          <>
            <AdminInventoryMobileList items={mobileItems} />
            <div className="admin-table-desktop admin-table-wrap">
              <AdminTable>
                <AdminTableHead>
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">On shelf</th>
                    <th className="px-4 py-3">Alert at</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Last movement</th>
                  </tr>
                </AdminTableHead>
                <tbody>
                  {visible.map((product) => {
                    const status =
                      product.stockQuantity <= 0 ? "Out" : isLowStock(product) ? "Low" : "OK";
                    const last = product.movements[0];
                    return (
                      <tr key={product.id} className="border-t border-navy/6 transition hover:bg-sand/20">
                        <td className="px-4 py-3.5">
                          <Link href={`/admin/products/${product.id}`} className="break-anywhere font-semibold text-teal">
                            {product.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3.5 text-navy/70">{product.category.name}</td>
                        <td className="px-4 py-3.5 tabular-nums">
                          {product.stockQuantity} {product.stockUnit}
                        </td>
                        <td className="px-4 py-3.5 tabular-nums text-navy/70">
                          {product.reorderThreshold}
                        </td>
                        <td className="px-4 py-3.5">
                          <AdminBadge
                            tone={status === "Out" ? "coral" : status === "Low" ? "sand" : "teal"}
                          >
                            {status === "Out" ? "Out of stock" : status}
                          </AdminBadge>
                        </td>
                        <td className="px-4 py-3.5 text-navy/70">
                          {last ? (
                            <>
                              {inventoryMovementLabel(last.type)}
                              {last.reason ? ` · ${last.reason}` : null}
                              <span className="block text-xs text-navy/45">
                                {formatAdminDateTime(last.createdAt)}
                              </span>
                            </>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </AdminTable>
            </div>
          </>
        )}
      </AdminCard>
    </div>
  );
}
