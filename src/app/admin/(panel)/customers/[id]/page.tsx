import {
  AdminBadge,
  AdminCard,
  AdminEmpty,
  AdminPageHeader,
} from "@/components/admin/ui";
import { formatKes } from "@/lib/format";
import { formatAdminDateTime } from "@/lib/admin-period";
import { orderStatusLabel, paymentStatusLabel } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

function orderBadgeTone(status: string): "teal" | "sand" | "coral" | "neutral" {
  if (status === "CANCELLED") return "coral";
  if (status === "ENQUIRY") return "sand";
  if (["CONFIRMED", "PROCESSING", "COMPLETED"].includes(status)) return "teal";
  return "neutral";
}

export default async function AdminCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      orders: {
        include: { payment: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!customer) notFound();

  const confirmedSales = customer.orders.filter((order) =>
    ["CONFIRMED", "PROCESSING", "COMPLETED"].includes(order.status),
  );
  const confirmedTotal = confirmedSales.reduce((sum, order) => sum + order.totalKes, 0);

  return (
    <div className="max-w-2xl">
      <AdminPageHeader
        title={customer.name}
        backHref="/admin/customers"
        backLabel="Customers"
        meta={
          <>
            {customer.phone}
            {customer.email ? ` · ${customer.email}` : null}
            {customer.location ? ` · ${customer.location}` : null}
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <AdminCard>
          <p className="text-sm font-medium text-navy/55">Total orders</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-navy">{customer.orders.length}</p>
        </AdminCard>
        <AdminCard>
          <p className="text-sm font-medium text-navy/55">Confirmed sales</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-navy">
            {formatKes(confirmedTotal)}
          </p>
        </AdminCard>
      </div>

      <AdminCard title="Order history">
        {customer.orders.length === 0 ? (
          <AdminEmpty>No orders yet.</AdminEmpty>
        ) : (
          <ul className="divide-y divide-navy/6">
            {customer.orders.map((order) => (
              <li key={order.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div>
                  <Link href={`/admin/orders/${order.id}`} className="font-semibold text-teal">
                    {order.orderNumber}
                  </Link>
                  <p className="mt-0.5 text-xs text-navy/45">{formatAdminDateTime(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <AdminBadge tone={orderBadgeTone(order.status)}>
                    {orderStatusLabel(order.status)}
                  </AdminBadge>
                  <p className="mt-1.5 text-sm tabular-nums text-navy/70">
                    {formatKes(order.totalKes)}
                  </p>
                  <p className="text-xs text-navy/45">
                    {paymentStatusLabel(order.payment?.status ?? "UNPAID")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>
    </div>
  );
}
