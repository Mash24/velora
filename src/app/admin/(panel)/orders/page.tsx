import { AdminOrdersMobileList } from "@/components/admin/AdminMobileLists";
import { awaitingPaymentWhere, newOrderWhere, toDeliverWhere } from "@/lib/admin-filters";
import {
  orderDeliveryListLabel,
  orderFulfillmentLabel,
  orderItemsSummary,
  orderListTotalLabel,
} from "@/lib/admin-order-display";
import {
  AdminBadge,
  AdminButtonLink,
  AdminCard,
  AdminEmpty,
  AdminFilterPill,
  AdminNotice,
  AdminPageHeader,
  AdminTable,
  AdminTableHead,
  adminButtonClass,
  adminInputClass,
} from "@/components/admin/ui";
import { orderStatusLabel, paymentStatusLabel } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { formatDisplayPhone } from "@/lib/phone";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import Link from "next/link";

const statuses = [
  { value: "", label: "All" },
  { value: "ENQUIRY", label: "New" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

function ordersWhere(query: {
  status?: string;
  needs?: string;
  payment?: string;
  delivery?: string;
  q?: string;
  when?: string;
}) {
  const and: object[] = [];
  if (query.needs === "payment") and.push(awaitingPaymentWhere);
  else if (query.needs === "delivery") and.push(toDeliverWhere);
  else if (query.status && Object.values(OrderStatus).includes(query.status as OrderStatus)) {
    and.push({ status: query.status as OrderStatus });
  }

  if (!query.needs && query.payment && Object.values(PaymentStatus).includes(query.payment as PaymentStatus)) {
    and.push({ payment: { status: query.payment as PaymentStatus } });
  }
  if (!query.needs && query.delivery === "pending") {
    and.push({ delivery: { status: { in: ["PENDING", "ASSIGNED"] } } });
  }
  if (!query.needs && query.delivery === "out") {
    and.push({ delivery: { status: "OUT_FOR_DELIVERY" } });
  }
  if (!query.needs && query.delivery === "delivered") {
    and.push({ delivery: { status: "DELIVERED" } });
  }

  const q = query.q?.trim();
  if (q) {
    and.push({
      OR: [
        { orderNumber: { contains: q, mode: "insensitive" } },
        { customer: { name: { contains: q, mode: "insensitive" } } },
        { customer: { phone: { contains: q, mode: "insensitive" } } },
      ],
    });
  }

  if (query.when === "today") {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    and.push({ createdAt: { gte: start } });
  }
  if (query.when === "7") {
    and.push({ createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } });
  }
  if (query.when === "30") {
    and.push({ createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } });
  }

  return and.length ? { AND: and } : {};
}

function href(next: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(next)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `/admin/orders?${query}` : "/admin/orders";
}

function statusTone(status: string): "sand" | "teal" | "navy" | "coral" | "neutral" {
  if (status === "ENQUIRY") return "sand";
  if (status === "CONFIRMED" || status === "PROCESSING") return "teal";
  if (status === "COMPLETED") return "navy";
  if (status === "CANCELLED") return "coral";
  return "neutral";
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    needs?: string;
    payment?: string;
    delivery?: string;
    q?: string;
    when?: string;
  }>;
}) {
  const query = await searchParams;
  const [orders, newCount] = await Promise.all([
    prisma.order.findMany({
      where: ordersWhere(query),
      include: { customer: true, payment: true, delivery: true, items: true },
      orderBy: { createdAt: "desc" },
      take: 80,
    }),
    prisma.order.count({ where: newOrderWhere }),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Orders"
        description="Review new requests, confirm sales, and track payment and delivery."
        actions={<AdminButtonLink href="/admin/sales/new">Record sale</AdminButtonLink>}
      />

      {newCount > 0 && query.status !== "ENQUIRY" && query.needs !== "payment" ? (
        <AdminNotice tone="warn">
          <Link href="/admin/orders?status=ENQUIRY" className="font-medium text-navy">
            {newCount} new {newCount === 1 ? "order" : "orders"} to review
            <span className="ml-2 text-teal">Open →</span>
          </Link>
        </AdminNotice>
      ) : null}

      <AdminCard className="mt-6" padding="p-4 sm:p-5">
        <form className="flex flex-col gap-3 sm:flex-row" action="/admin/orders">
          <input type="hidden" name="status" value={query.status ?? ""} />
          <input type="hidden" name="needs" value={query.needs ?? ""} />
          <label className="sr-only" htmlFor="order-search">
            Search orders
          </label>
          <input
            id="order-search"
            name="q"
            defaultValue={query.q}
            placeholder="Search order, customer or phone"
            className={`${adminInputClass} sm:flex-1`}
          />
          <button type="submit" className={adminButtonClass("primary")}>
            Search
          </button>
        </form>

        <div className="mt-5 space-y-3">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-navy/45">Status</p>
            <div className="flex flex-wrap gap-2">
              {statuses.map((item) => (
                <AdminFilterPill
                  key={item.label}
                  href={href({
                    status: item.value,
                    q: query.q,
                    payment: query.payment,
                    delivery: query.delivery,
                    when: query.when,
                  })}
                  active={(query.status ?? "") === item.value && !query.needs}
                >
                  {item.label}
                </AdminFilterPill>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-navy/45">
              Payment & delivery
            </p>
            <div className="flex flex-wrap gap-2">
              <AdminFilterPill
                href={href({ status: query.status, q: query.q, when: query.when, delivery: query.delivery })}
                active={!query.payment && query.needs !== "payment"}
              >
                All payments
              </AdminFilterPill>
              <AdminFilterPill
                href={href({
                  status: query.status,
                  q: query.q,
                  when: query.when,
                  delivery: query.delivery,
                  payment: "UNPAID",
                })}
                active={query.payment === "UNPAID" || query.needs === "payment"}
              >
                Unpaid
              </AdminFilterPill>
              <AdminFilterPill
                href={href({
                  status: query.status,
                  q: query.q,
                  when: query.when,
                  delivery: query.delivery,
                  payment: "PAID",
                })}
                active={query.payment === "PAID"}
              >
                Paid
              </AdminFilterPill>
              <AdminFilterPill
                href={href({ status: query.status, q: query.q, when: query.when, payment: query.payment, delivery: "pending" })}
                active={query.delivery === "pending"}
              >
                Delivery pending
              </AdminFilterPill>
              <AdminFilterPill
                href={href({ status: query.status, q: query.q, when: query.when, payment: query.payment, delivery: "out" })}
                active={query.delivery === "out"}
              >
                Out for delivery
              </AdminFilterPill>
              <AdminFilterPill
                href={href({ status: query.status, q: query.q, when: query.when, payment: query.payment, delivery: "delivered" })}
                active={query.delivery === "delivered"}
              >
                Delivered
              </AdminFilterPill>
            </div>
          </div>
        </div>
      </AdminCard>

      <AdminCard className="mt-6" padding="p-0">
        {orders.length === 0 ? (
          <AdminEmpty>No orders match that view.</AdminEmpty>
        ) : (
          <>
            <AdminOrdersMobileList orders={orders} statusTone={statusTone} />
            <div className="admin-table-desktop admin-table-wrap">
              <AdminTable>
          <AdminTableHead>
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Products</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Fulfillment</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </AdminTableHead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className={`border-t border-navy/6 transition hover:bg-sand/25 ${
                  order.status === "ENQUIRY" ? "bg-sand/35" : ""
                }`}
              >
                <td className="px-4 py-3.5">
                  <Link href={`/admin/orders/${order.id}`} className="font-semibold text-teal">
                    {order.orderNumber}
                  </Link>
                  {order.refundRequired ? (
                    <div className="mt-1 text-xs text-coral">Refund may be required</div>
                  ) : null}
                </td>
                <td className="px-4 py-3.5">
                  <p className="font-medium text-navy">{order.customer.name}</p>
                  <p className="text-xs text-navy/50">{formatDisplayPhone(order.customer.phone)}</p>
                </td>
                <td className="max-w-48 px-4 py-3.5 text-navy/75">{orderItemsSummary(order.items)}</td>
                <td className="px-4 py-3.5">
                  <AdminBadge tone={statusTone(order.status)}>{orderStatusLabel(order.status)}</AdminBadge>
                </td>
                <td className="px-4 py-3.5">
                  <AdminBadge tone={order.payment?.status === "PAID" ? "teal" : "coral"}>
                    {paymentStatusLabel(order.payment?.status ?? "UNPAID")}
                  </AdminBadge>
                </td>
                <td className="px-4 py-3.5">
                  <p className="text-sm text-navy/80">{orderDeliveryListLabel(order)}</p>
                  <p className="text-xs text-navy/45">
                    {orderFulfillmentLabel(order.delivery?.address, order.delivery?.zone)}
                  </p>
                </td>
                <td className="px-4 py-3.5 text-right font-medium tabular-nums">
                  {orderListTotalLabel(order)}
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
