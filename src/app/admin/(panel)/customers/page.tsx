import { AdminCustomersMobileList } from "@/components/admin/AdminMobileLists";
import {
  AdminCard,
  AdminEmpty,
  AdminFilterPill,
  AdminFilterRow,
  AdminPageHeader,
  AdminTable,
  AdminTableHead,
  adminButtonClass,
  adminInputClass,
} from "@/components/admin/ui";
import { formatAdminRelativeTime } from "@/lib/admin-period";
import { formatKes } from "@/lib/format";
import { formatDisplayPhone } from "@/lib/phone";
import { prisma } from "@/lib/prisma";
import { sourceLabel } from "@/lib/source";
import { CustomerSource } from "@prisma/client";
import Link from "next/link";

const SOURCE_FILTERS: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "WALK_IN", label: "Shop visit" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "WEBSITE", label: "Website" },
  { value: "TIKTOK", label: "TikTok" },
  { value: "REFERRAL", label: "Referral" },
  { value: "OTHER", label: "Other" },
];

function href(next: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(next)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `/admin/customers?${query}` : "/admin/customers";
}

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; source?: string }>;
}) {
  const { q, source } = await searchParams;
  const term = q?.trim() ?? "";
  const sourceFilter =
    source && Object.values(CustomerSource).includes(source as CustomerSource)
      ? (source as CustomerSource)
      : undefined;

  const [customers, totalCount] = await Promise.all([
    prisma.customer.findMany({
      where: {
        ...(sourceFilter ? { source: sourceFilter } : {}),
        ...(term
          ? {
              OR: [
                { name: { contains: term, mode: "insensitive" } },
                { phone: { contains: term, mode: "insensitive" } },
                { email: { contains: term, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        orders: {
          select: {
            id: true,
            status: true,
            totalKes: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.customer.count(),
  ]);

  const mobileItems = customers.map((customer) => {
    const confirmed = customer.orders.filter((order) =>
      ["CONFIRMED", "PROCESSING", "COMPLETED"].includes(order.status),
    );
    const lastOrder = customer.orders[0];
    return {
      id: customer.id,
      name: customer.name,
      phone: formatDisplayPhone(customer.phone),
      sourceLabel: sourceLabel(customer.source),
      orderCount: customer._count.orders,
      confirmedTotal: confirmed.reduce((sum, order) => sum + order.totalKes, 0),
      lastOrderLabel: lastOrder
        ? formatAdminRelativeTime(lastOrder.createdAt)
        : "No orders yet",
    };
  });

  return (
    <div className="min-w-0">
      <AdminPageHeader
        title="Customers"
        description="People from website requests, walk-ins, calls, and WhatsApp sales."
        meta={
          totalCount > 0 ? (
            <span>
              {totalCount} customer{totalCount === 1 ? "" : "s"}
              {customers.length < totalCount && (term || sourceFilter)
                ? ` · showing ${customers.length}`
                : ""}
            </span>
          ) : null
        }
      />

      <AdminFilterRow>
        {SOURCE_FILTERS.map((item) => (
          <AdminFilterPill
            key={item.label}
            href={href({ source: item.value || undefined, q: term || undefined })}
            active={(sourceFilter ?? "") === item.value}
          >
            {item.label}
          </AdminFilterPill>
        ))}
      </AdminFilterRow>

      <AdminCard className="mb-6" padding="p-4 sm:p-5">
        <form className="flex flex-col gap-3 sm:flex-row" action="/admin/customers">
          {sourceFilter ? <input type="hidden" name="source" value={sourceFilter} /> : null}
          <label className="sr-only" htmlFor="customer-search">
            Search customers
          </label>
          <input
            id="customer-search"
            name="q"
            defaultValue={term}
            placeholder="Search name, phone or email"
            className={`${adminInputClass} min-w-0 sm:flex-1`}
          />
          <button type="submit" className={adminButtonClass("primary")}>
            Search
          </button>
        </form>
      </AdminCard>

      <AdminCard padding="p-0">
        {customers.length === 0 ? (
          <AdminEmpty>
            {totalCount === 0 ? (
              <>
                No customers yet. Website requests and{" "}
                <Link href="/admin/sales/new" className="font-semibold text-teal">
                  recorded sales
                </Link>{" "}
                will appear here.
              </>
            ) : term ? (
              <>No customers match “{term}”.</>
            ) : (
              <>No customers from that source.</>
            )}
          </AdminEmpty>
        ) : (
          <>
            <AdminCustomersMobileList customers={mobileItems} />
            <div className="admin-table-desktop admin-table-wrap">
              <AdminTable>
                <AdminTableHead>
                  <tr>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Orders</th>
                    <th className="px-4 py-3">Last order</th>
                    <th className="px-4 py-3 text-right">Confirmed sales</th>
                    <th className="px-4 py-3">
                      <span className="sr-only">Open</span>
                    </th>
                  </tr>
                </AdminTableHead>
                <tbody>
                  {customers.map((customer) => {
                    const confirmed = customer.orders.filter((order) =>
                      ["CONFIRMED", "PROCESSING", "COMPLETED"].includes(order.status),
                    );
                    const confirmedTotal = confirmed.reduce(
                      (sum, order) => sum + order.totalKes,
                      0,
                    );
                    const lastOrder = customer.orders[0];
                    return (
                      <tr
                        key={customer.id}
                        className="border-t border-navy/6 transition hover:bg-sand/25"
                      >
                        <td className="px-4 py-3.5">
                          <Link
                            href={`/admin/customers/${customer.id}`}
                            className="break-anywhere font-semibold text-teal hover:underline"
                          >
                            {customer.name}
                          </Link>
                          <p className="mt-0.5 text-xs tabular-nums text-navy/50">
                            {formatDisplayPhone(customer.phone)}
                          </p>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-navy/70">
                          {sourceLabel(customer.source)}
                        </td>
                        <td className="px-4 py-3.5 tabular-nums text-navy">
                          {customer._count.orders}
                        </td>
                        <td className="px-4 py-3.5 text-sm text-navy/60">
                          {lastOrder ? formatAdminRelativeTime(lastOrder.createdAt) : "—"}
                        </td>
                        <td className="px-4 py-3.5 text-right font-semibold tabular-nums text-navy">
                          {formatKes(confirmedTotal)}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <Link
                            href={`/admin/customers/${customer.id}`}
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
