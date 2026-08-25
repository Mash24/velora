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
  AdminFilterRow,
  AdminNotice,
  AdminPageHeader,
  AdminTable,
  AdminTableHead,
  adminButtonClass,
  adminInputClass,
} from "@/components/admin/ui";
import { formatAdminRelativeTime } from "@/lib/admin-period";
import { orderStatusLabel, paymentStatusLabel } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { formatDisplayPhone } from "@/lib/phone";
import { OrderStatus } from "@prisma/client";
import Link from "next/link";

const browseStatuses = [
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "COMPLETED", label: "Closed" },
  { value: "CANCELLED", label: "Cancelled" },
];

function ordersWhere(query: {
  status?: string;
  needs?: string;
  q?: string;
  when?: string;
}) {
  const and: object[] = [];
  if (query.needs === "payment") and.push(awaitingPaymentWhere);
  else if (query.needs === "delivery") and.push(toDeliverWhere);
  else if (query.status === "CONFIRMED") {
    and.push({ status: { in: [OrderStatus.CONFIRMED, OrderStatus.PROCESSING] } });
  } else if (query.status && Object.values(OrderStatus).includes(query.status as OrderStatus)) {
    and.push({ status: query.status as OrderStatus });
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

function viewLabel(query: { status?: string; needs?: string; when?: string; q?: string }) {
  if (query.needs === "payment") return "awaiting payment";
  if (query.needs === "delivery") return "to deliver";
  if (query.status === "ENQUIRY") return "new";
  if (query.status) return orderStatusLabel(query.status).toLowerCase();
  if (query.when === "today") return "from today";
  if (query.when === "7") return "from the last 7 days";
  if (query.q) return "matching that search";
  return null;
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
  // Legacy dashboard/deep links used payment= / delivery=; map unpaid → needs=payment
  const needs =
    query.needs ??
    (query.payment === "UNPAID" ? "payment" : undefined) ??
    (query.delivery === "pending" || query.delivery === "out" ? "delivery" : undefined);

  const normalized = {
    status: needs ? undefined : query.status,
    needs,
    q: query.q,
    when: query.when,
  };

  const where = ordersWhere(normalized);

  const [orders, newCount, unpaidCount, deliverCount] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { customer: true, payment: true, delivery: true, items: true },
      orderBy: { createdAt: "desc" },
      take: 80,
    }),
    prisma.order.count({ where: newOrderWhere }),
    prisma.order.count({ where: awaitingPaymentWhere }),
    prisma.order.count({ where: toDeliverWhere }),
  ]);

  const focus =
    needs === "payment"
      ? "payment"
      : needs === "delivery"
        ? "delivery"
        : normalized.status === "ENQUIRY"
          ? "new"
          : "all";
  const allActive = focus === "all" && !normalized.status;
  const emptyHint = viewLabel(normalized);

  return (
    <div className="min-w-0">
      <AdminPageHeader
        title="Orders"
        description="Review new requests, then track payment and delivery."
        actions={<AdminButtonLink href="/admin/sales/new">Record a sale</AdminButtonLink>}
      />

      {newCount > 0 && focus !== "new" ? (
        <AdminNotice tone="warn" className="mb-6">
          <Link href="/admin/orders?status=ENQUIRY" className="flex items-center justify-between gap-3 font-medium text-navy">
            <span>
              {newCount} new {newCount === 1 ? "order" : "orders"} waiting to be reviewed
            </span>
            <span className="shrink-0 text-teal">Open →</span>
          </Link>
        </AdminNotice>
      ) : null}

      <AdminFilterRow>
        <AdminFilterPill href={href({ q: normalized.q, when: normalized.when })} active={allActive}>
          All
        </AdminFilterPill>
        <AdminFilterPill
          href={href({ status: "ENQUIRY", q: normalized.q, when: normalized.when })}
          active={focus === "new"}
        >
          New{newCount > 0 ? ` (${newCount})` : ""}
        </AdminFilterPill>
        <AdminFilterPill
          href={href({ needs: "payment", q: normalized.q, when: normalized.when })}
          active={focus === "payment"}
        >
          Awaiting payment{unpaidCount > 0 ? ` (${unpaidCount})` : ""}
        </AdminFilterPill>
        <AdminFilterPill
          href={href({ needs: "delivery", q: normalized.q, when: normalized.when })}
          active={focus === "delivery"}
        >
          To deliver{deliverCount > 0 ? ` (${deliverCount})` : ""}
        </AdminFilterPill>
      </AdminFilterRow>

      {allActive || (normalized.status && normalized.status !== "ENQUIRY") ? (
        <AdminFilterRow>
          {browseStatuses.map((item) => (
            <AdminFilterPill
              key={item.value}
              href={href({ status: item.value, q: normalized.q, when: normalized.when })}
              active={normalized.status === item.value}
            >
              {item.label}
            </AdminFilterPill>
          ))}
        </AdminFilterRow>
      ) : null}

      <AdminCard className="mb-6" padding="p-4 sm:p-5">
        <form className="flex flex-col gap-3 sm:flex-row sm:items-center" action="/admin/orders">
          {normalized.status ? <input type="hidden" name="status" value={normalized.status} /> : null}
          {normalized.needs ? <input type="hidden" name="needs" value={normalized.needs} /> : null}
          {normalized.when ? <input type="hidden" name="when" value={normalized.when} /> : null}
          <label className="sr-only" htmlFor="order-search">
            Search orders
          </label>
          <input
            id="order-search"
            name="q"
            defaultValue={normalized.q}
            placeholder="Search order #, name or phone"
            className={`${adminInputClass} min-w-0 sm:flex-1`}
          />
          <button type="submit" className={adminButtonClass("primary")}>
            Search
          </button>
        </form>
        <AdminFilterRow className="mb-0 mt-3">
          <AdminFilterPill
            href={href({
              status: normalized.status,
              needs: normalized.needs,
              q: normalized.q,
            })}
            active={!normalized.when}
          >
            Any time
          </AdminFilterPill>
          <AdminFilterPill
            href={href({
              status: normalized.status,
              needs: normalized.needs,
              q: normalized.q,
              when: "today",
            })}
            active={normalized.when === "today"}
          >
            Today
          </AdminFilterPill>
          <AdminFilterPill
            href={href({
              status: normalized.status,
              needs: normalized.needs,
              q: normalized.q,
              when: "7",
            })}
            active={normalized.when === "7"}
          >
            Last 7 days
          </AdminFilterPill>
        </AdminFilterRow>
      </AdminCard>

      <AdminCard padding="p-0">
        {orders.length === 0 ? (
          <AdminEmpty>
            {emptyHint ? (
              <>No orders {emptyHint}.</>
            ) : (
              <>
                No orders yet.{" "}
                <Link href="/admin/sales/new" className="font-semibold text-teal">
                  Record a sale
                </Link>{" "}
                or wait for a website request.
              </>
            )}
          </AdminEmpty>
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
                    <th className="px-4 py-3">Delivery</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3">
                      <span className="sr-only">Open</span>
                    </th>
                  </tr>
                </AdminTableHead>
                <tbody>
                  {orders.map((order) => {
                    const isNew = order.status === "ENQUIRY";
                    return (
                      <tr
                        key={order.id}
                        className={`border-t border-navy/6 transition hover:bg-sand/30 ${
                          isNew ? "bg-sand/30" : ""
                        }`}
                      >
                        <td className="px-4 py-3.5">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="font-semibold text-teal hover:underline"
                          >
                            {order.orderNumber}
                          </Link>
                          <p className="mt-0.5 text-xs text-navy/50">
                            {formatAdminRelativeTime(order.createdAt)}
                          </p>
                          {order.refundRequired ? (
                            <p className="mt-1 text-xs font-medium text-coral">Refund may be needed</p>
                          ) : null}
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-medium text-navy">{order.customer.name}</p>
                          <p className="text-xs text-navy/50">{formatDisplayPhone(order.customer.phone)}</p>
                        </td>
                        <td className="max-w-[12rem] px-4 py-3.5 text-sm text-navy/75">
                          {orderItemsSummary(order.items)}
                        </td>
                        <td className="px-4 py-3.5">
                          <AdminBadge tone={statusTone(order.status)}>
                            {orderStatusLabel(order.status)}
                          </AdminBadge>
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
                        <td className="px-4 py-3.5 text-right font-semibold tabular-nums text-navy">
                          {orderListTotalLabel(order)}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className={
                              isNew
                                ? adminButtonClass("primary")
                                : "text-sm font-semibold text-teal hover:underline"
                            }
                          >
                            {isNew ? "Process" : "Open →"}
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
