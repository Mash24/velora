import { AdminInventoryMobileList } from "@/components/admin/AdminMobileLists";
import { InventoryReceiveButton } from "@/components/admin/InventoryReceiveButton";
import {
  AdminBadge,
  AdminCard,
  AdminEmpty,
  AdminFilterPill,
  AdminFilterRow,
  AdminNotice,
  AdminPageHeader,
  AdminTable,
  AdminTableHead,
  adminButtonClass,
  adminInputClass,
} from "@/components/admin/ui";
import { isLowStock } from "@/lib/admin-filters";
import { formatAdminRelativeTime } from "@/lib/admin-period";
import { inventoryMovementLabel } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

function href(next: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(next)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `/admin/inventory?${query}` : "/admin/inventory";
}

function statusOf(product: { stockQuantity: number; reorderThreshold: number }) {
  if (product.stockQuantity <= 0) return { key: "out" as const, label: "Out of stock", tone: "coral" as const };
  if (isLowStock(product)) return { key: "low" as const, label: "Low stock", tone: "sand" as const };
  return { key: "ok" as const, label: "OK", tone: "teal" as const };
}

function urgencyRank(status: "out" | "low" | "ok") {
  if (status === "out") return 0;
  if (status === "low") return 1;
  return 2;
}

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; stock?: string }>;
}) {
  const { q, stock } = await searchParams;
  const query = q?.trim() ?? "";

  const products = await prisma.product.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { sku: { contains: query, mode: "insensitive" } },
            { category: { name: { contains: query, mode: "insensitive" } } },
          ],
        }
      : undefined,
    include: {
      category: true,
      movements: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { name: "asc" },
  });

  const low = products.filter(isLowStock);
  const out = products.filter((product) => product.stockQuantity <= 0);
  const filtered =
    stock === "low" ? low : stock === "out" ? out : products;

  const visible = [...filtered].sort((a, b) => {
    const rank = urgencyRank(statusOf(a).key) - urgencyRank(statusOf(b).key);
    if (rank !== 0) return rank;
    return a.name.localeCompare(b.name);
  });

  const attentionCount = out.length + low.filter((p) => p.stockQuantity > 0).length;

  const mobileItems = visible.map((product) => {
    const status = statusOf(product);
    const last = product.movements[0];
    return {
      id: product.id,
      name: product.name,
      categoryName: product.category.name,
      stockQuantity: product.stockQuantity,
      stockUnit: product.stockUnit,
      reorderThreshold: product.reorderThreshold,
      status: status.key === "out" ? "Out" : status.key === "low" ? "Low" : "OK",
      statusTone: status.tone,
      lastMovement: last ? (
        <>
          {inventoryMovementLabel(last.type)}
          {last.reason ? ` · ${last.reason}` : null}
          <span className="block text-navy/45">{formatAdminRelativeTime(last.createdAt)}</span>
        </>
      ) : (
        "No movements yet"
      ),
    };
  });

  return (
    <div className="min-w-0">
      <AdminPageHeader
        title="Stock"
        description="What’s on the shelf. Receive stock here — corrections stay on the product page."
      />

      {attentionCount > 0 && stock !== "low" && stock !== "out" && !query ? (
        <AdminNotice tone="warn" className="mb-6">
          <Link
            href={out.length > 0 ? "/admin/inventory?stock=out" : "/admin/inventory?stock=low"}
            className="flex items-center justify-between gap-3 font-medium text-navy"
          >
            <span>
              {out.length > 0
                ? `${out.length} out of stock${low.filter((p) => p.stockQuantity > 0).length ? ` · ${low.filter((p) => p.stockQuantity > 0).length} low` : ""}`
                : `${low.length} low on stock`}
            </span>
            <span className="shrink-0 text-teal">Review →</span>
          </Link>
        </AdminNotice>
      ) : null}

      <AdminFilterRow>
        <AdminFilterPill href={href({ q: query || undefined })} active={!stock}>
          All ({products.length})
        </AdminFilterPill>
        <AdminFilterPill href={href({ stock: "low", q: query || undefined })} active={stock === "low"}>
          Low ({low.length})
        </AdminFilterPill>
        <AdminFilterPill href={href({ stock: "out", q: query || undefined })} active={stock === "out"}>
          Out ({out.length})
        </AdminFilterPill>
      </AdminFilterRow>

      <AdminCard className="mb-6" padding="p-4 sm:p-5">
        <form className="flex flex-col gap-3 sm:flex-row" action="/admin/inventory">
          {stock ? <input type="hidden" name="stock" value={stock} /> : null}
          <label className="sr-only" htmlFor="stock-search">
            Search stock
          </label>
          <input
            id="stock-search"
            name="q"
            defaultValue={query}
            placeholder="Search name, SKU or category"
            className={`${adminInputClass} min-w-0 sm:flex-1`}
          />
          <button type="submit" className={adminButtonClass("primary")}>
            Search
          </button>
        </form>
      </AdminCard>

      <AdminCard padding="p-0">
        {visible.length === 0 ? (
          <AdminEmpty>
            {products.length === 0 && !query ? (
              <>
                No products yet.{" "}
                <Link href="/admin/products/new" className="font-semibold text-teal">
                  Add a product
                </Link>
              </>
            ) : query ? (
              <>No products match “{query}”.</>
            ) : stock === "out" ? (
              <>Nothing is out of stock.</>
            ) : stock === "low" ? (
              <>Nothing is low on stock.</>
            ) : (
              <>No products match that view.</>
            )}
          </AdminEmpty>
        ) : (
          <>
            <AdminInventoryMobileList items={mobileItems} />
            <div className="admin-table-desktop admin-table-wrap">
              <AdminTable>
                <AdminTableHead>
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">On shelf</th>
                    <th className="px-4 py-3">Alert</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Last change</th>
                    <th className="px-4 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </AdminTableHead>
                <tbody>
                  {visible.map((product) => {
                    const status = statusOf(product);
                    const last = product.movements[0];
                    return (
                      <tr
                        key={product.id}
                        className={`border-t border-navy/6 transition hover:bg-sand/25 ${
                          status.key === "out"
                            ? "bg-coral/[0.04]"
                            : status.key === "low"
                              ? "bg-sand/35"
                              : ""
                        }`}
                      >
                        <td className="px-4 py-3.5">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="break-anywhere font-semibold text-teal hover:underline"
                          >
                            {product.name}
                          </Link>
                          <p className="text-xs text-navy/50">{product.category.name}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-base font-semibold tabular-nums text-navy">
                            {product.stockQuantity}
                          </span>
                          <span className="ml-1 text-sm text-navy/55">{product.stockUnit}</span>
                        </td>
                        <td className="px-4 py-3.5 tabular-nums text-sm text-navy/60">
                          ≤ {product.reorderThreshold}
                        </td>
                        <td className="px-4 py-3.5">
                          <AdminBadge tone={status.tone}>{status.label}</AdminBadge>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-navy/70">
                          {last ? (
                            <>
                              <span>
                                {inventoryMovementLabel(last.type)}
                                {last.reason ? ` · ${last.reason}` : ""}
                              </span>
                              <span className="mt-0.5 block text-xs text-navy/45">
                                {formatAdminRelativeTime(last.createdAt)}
                              </span>
                            </>
                          ) : (
                            <span className="text-navy/40">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col items-end gap-2">
                            <InventoryReceiveButton
                              productId={product.id}
                              stockUnit={product.stockUnit}
                              compact
                            />
                            <Link
                              href={`/admin/products/${product.id}`}
                              className="text-sm font-medium text-navy/45 hover:text-navy"
                            >
                              Open →
                            </Link>
                          </div>
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
