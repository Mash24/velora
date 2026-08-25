import { AdminProductsMobileList } from "@/components/admin/AdminMobileLists";
import {
  AdminBadge,
  AdminButtonLink,
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
import { priceWithUnit } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { sanitizePublicUrl } from "@/lib/storage";
import Link from "next/link";

function href(next: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(next)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `/admin/products?${query}` : "/admin/products";
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; q?: string }>;
}) {
  const { view, q } = await searchParams;
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
      subcategory: true,
      images: { take: 1, select: { id: true, url: true } },
    },
    orderBy: { name: "asc" },
  });

  // Counts from full catalogue (not search-filtered) for the filter pills
  const [allCount, shopCount, hiddenCount, needsPhotoCount] = query
    ? [
        products.length,
        products.filter((p) => p.isActive).length,
        products.filter((p) => !p.isActive).length,
        products.filter((p) => !p.isActive && p.images.length === 0).length,
      ]
    : await Promise.all([
        prisma.product.count(),
        prisma.product.count({ where: { isActive: true } }),
        prisma.product.count({ where: { isActive: false } }),
        prisma.product.count({
          where: { isActive: false, images: { none: {} } },
        }),
      ]);

  const visible = products.filter((product) => {
    if (view === "shop") return product.isActive;
    if (view === "hidden") return !product.isActive;
    if (view === "photo") return !product.isActive && product.images.length === 0;
    return true;
  });

  function statusOf(product: (typeof products)[number]) {
    if (product.isActive) return { label: "In the shop", tone: "teal" as const };
    if (product.images.length === 0) return { label: "Needs a photo", tone: "coral" as const };
    return { label: "Hidden", tone: "sand" as const };
  }

  const mobileItems = visible.map((product) => {
    const status = statusOf(product);
    const low =
      product.stockQuantity <= product.reorderThreshold && product.stockQuantity >= 0;
    return {
      id: product.id,
      name: product.name,
      imageUrl: product.images[0]?.url ? sanitizePublicUrl(product.images[0].url) : null,
      categoryLabel: `${product.category.name}${product.subcategory ? ` · ${product.subcategory.name}` : ""}`,
      priceLabel: priceWithUnit(product.priceKes, product.unit),
      stockLabel: `${product.stockQuantity} ${product.stockUnit}`,
      lowStock: low,
      visible: product.isActive,
      statusLabel: status.label,
      statusTone: status.tone,
    };
  });

  return (
    <div className="min-w-0">
      <AdminPageHeader
        title="Products"
        description="Catalogue for the shop. Hidden products stay off the website."
        actions={<AdminButtonLink href="/admin/products/new">Add a product</AdminButtonLink>}
      />

      {needsPhotoCount > 0 && view !== "photo" && !query ? (
        <AdminNotice tone="warn" className="mb-6">
          <Link
            href="/admin/products?view=photo"
            className="flex items-center justify-between gap-3 font-medium text-navy"
          >
            <span>
              {needsPhotoCount} {needsPhotoCount === 1 ? "product needs" : "products need"} a photo
              before publishing
            </span>
            <span className="shrink-0 text-teal">Open →</span>
          </Link>
        </AdminNotice>
      ) : null}

      <AdminFilterRow>
        <AdminFilterPill href={href({ q: query || undefined })} active={!view}>
          All ({allCount})
        </AdminFilterPill>
        <AdminFilterPill href={href({ view: "shop", q: query || undefined })} active={view === "shop"}>
          In the shop ({shopCount})
        </AdminFilterPill>
        <AdminFilterPill
          href={href({ view: "hidden", q: query || undefined })}
          active={view === "hidden"}
        >
          Hidden ({hiddenCount})
        </AdminFilterPill>
        <AdminFilterPill
          href={href({ view: "photo", q: query || undefined })}
          active={view === "photo"}
        >
          Needs photo{needsPhotoCount > 0 ? ` (${needsPhotoCount})` : ""}
        </AdminFilterPill>
      </AdminFilterRow>

      <AdminCard className="mb-6" padding="p-4 sm:p-5">
        <form className="flex flex-col gap-3 sm:flex-row" action="/admin/products">
          {view ? <input type="hidden" name="view" value={view} /> : null}
          <label className="sr-only" htmlFor="product-search">
            Search products
          </label>
          <input
            id="product-search"
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
            {allCount === 0 && !query ? (
              <>
                No products yet.{" "}
                <Link href="/admin/products/new" className="font-semibold text-teal">
                  Add your first product
                </Link>
              </>
            ) : query ? (
              <>No products match “{query}”.</>
            ) : view === "photo" ? (
              <>Every product has a photo — or is already in the shop.</>
            ) : (
              <>Nothing in this view.</>
            )}
          </AdminEmpty>
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
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">
                      <span className="sr-only">Open</span>
                    </th>
                  </tr>
                </AdminTableHead>
                <tbody>
                  {visible.map((product) => {
                    const status = statusOf(product);
                    const low =
                      product.stockQuantity <= product.reorderThreshold;
                    const thumb = product.images[0]?.url
                      ? sanitizePublicUrl(product.images[0].url)
                      : null;
                    return (
                      <tr
                        key={product.id}
                        className="border-t border-navy/6 transition hover:bg-sand/25"
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-mist/70">
                              {thumb ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={thumb}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="grid h-full place-items-center text-[9px] font-semibold uppercase tracking-wider text-navy/35">
                                  No photo
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <Link
                                href={`/admin/products/${product.id}`}
                                className="break-anywhere font-semibold text-teal hover:underline"
                              >
                                {product.name}
                              </Link>
                              <p className="break-anywhere text-xs text-navy/50">
                                {product.category.name}
                                {product.subcategory ? ` · ${product.subcategory.name}` : ""}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm tabular-nums text-navy/85">
                          {priceWithUnit(product.priceKes, product.unit)}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="tabular-nums text-navy">
                            {product.stockQuantity} {product.stockUnit}
                          </span>
                          {low ? (
                            <span className="mt-0.5 block text-xs font-medium text-coral">
                              {product.stockQuantity === 0 ? "Out of stock" : "Low stock"}
                            </span>
                          ) : null}
                        </td>
                        <td className="px-4 py-3.5">
                          <AdminBadge tone={status.tone}>{status.label}</AdminBadge>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="text-sm font-semibold text-teal hover:underline"
                          >
                            Open →
                          </Link>
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
