import { AdminCustomersMobileList } from "@/components/admin/AdminMobileLists";
import {
  AdminCard,
  AdminEmpty,
  AdminPageHeader,
  AdminTable,
  AdminTableHead,
  adminButtonClass,
  adminInputClass,
} from "@/components/admin/ui";
import { formatKes } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { sourceLabel } from "@/lib/source";
import Link from "next/link";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const term = q?.trim();
  const customers = await prisma.customer.findMany({
    where: term
      ? {
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { phone: { contains: term, mode: "insensitive" } },
          ],
        }
      : {},
    include: {
      orders: {
        where: { status: { in: ["CONFIRMED", "PROCESSING", "COMPLETED"] } },
        select: { totalKes: true },
      },
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const mobileItems = customers.map((customer) => ({
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    sourceLabel: sourceLabel(customer.source),
    orderCount: customer._count.orders,
    confirmedTotal: customer.orders.reduce((sum, order) => sum + order.totalKes, 0),
  }));

  return (
    <div className="min-w-0">
      <AdminPageHeader
        title="Customers"
        description="Everyone who has ordered or been recorded from a walk-in, phone, or WhatsApp sale."
      />

      <form className="mb-6 flex min-w-0 flex-col gap-3 sm:flex-row" action="/admin/customers">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name or phone…"
          className={`${adminInputClass} min-w-0 flex-1`}
        />
        <button type="submit" className={`${adminButtonClass("primary")} sm:shrink-0`}>
          Search
        </button>
      </form>

      <AdminCard padding="p-0">
        {customers.length === 0 ? (
          <AdminEmpty>
            No customers yet. Website order requests and recorded sales will appear here.
          </AdminEmpty>
        ) : (
          <>
            <AdminCustomersMobileList customers={mobileItems} />
            <div className="admin-table-desktop admin-table-wrap">
              <AdminTable>
                <AdminTableHead>
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Orders</th>
                    <th className="px-4 py-3 text-right">Confirmed sales</th>
                  </tr>
                </AdminTableHead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id} className="border-t border-navy/6 transition hover:bg-sand/20">
                      <td className="px-4 py-3.5 font-medium">
                        <Link href={`/admin/customers/${customer.id}`} className="break-anywhere font-semibold text-teal">
                          {customer.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 text-navy/75">{customer.phone}</td>
                      <td className="px-4 py-3.5 text-navy/70">{sourceLabel(customer.source)}</td>
                      <td className="px-4 py-3.5 tabular-nums">{customer._count.orders}</td>
                      <td className="px-4 py-3.5 text-right tabular-nums">
                        {formatKes(customer.orders.reduce((sum, order) => sum + order.totalKes, 0))}
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
