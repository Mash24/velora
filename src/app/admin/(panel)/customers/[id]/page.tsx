import {
  AdminBadge,
  AdminCard,
  AdminEmpty,
  AdminPageHeader,
  adminButtonClass,
} from "@/components/admin/ui";
import { formatAdminDateTime, formatAdminRelativeTime } from "@/lib/admin-period";
import { formatKes } from "@/lib/format";
import { orderStatusLabel, paymentStatusLabel } from "@/lib/labels";
import { formatDisplayPhone, normalizeKenyanPhone } from "@/lib/phone";
import { prisma } from "@/lib/prisma";
import { sourceLabel } from "@/lib/source";
import Link from "next/link";
import { notFound } from "next/navigation";

function orderBadgeTone(status: string): "teal" | "sand" | "coral" | "neutral" | "navy" {
  if (status === "CANCELLED") return "coral";
  if (status === "ENQUIRY") return "sand";
  if (status === "COMPLETED") return "navy";
  if (["CONFIRMED", "PROCESSING"].includes(status)) return "teal";
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
        include: { payment: true, items: { select: { name: true, quantity: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!customer) notFound();

  const confirmedSales = customer.orders.filter((order) =>
    ["CONFIRMED", "PROCESSING", "COMPLETED"].includes(order.status),
  );
  const openEnquiries = customer.orders.filter((order) => order.status === "ENQUIRY");
  const confirmedTotal = confirmedSales.reduce((sum, order) => sum + order.totalKes, 0);
  const waPhone = normalizeKenyanPhone(customer.phone).replace(/\D/g, "");

  return (
    <div className="min-w-0 w-full max-w-2xl">
      <AdminPageHeader
        title={customer.name}
        backHref="/admin/customers"
        backLabel="Customers"
        meta={
          <span>
            Customer since {formatAdminDateTime(customer.createdAt)} · via{" "}
            {sourceLabel(customer.source)}
          </span>
        }
      />

      <AdminCard className="mb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-navy/55">Contact</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-navy">
              {formatDisplayPhone(customer.phone)}
            </p>
            {customer.email ? <p className="mt-1 text-sm text-navy/70">{customer.email}</p> : null}
            {customer.location ? (
              <p className="mt-2 text-sm leading-6 text-navy/70">{customer.location}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2 sm:w-auto sm:flex-row">
            <a href={`tel:${customer.phone}`} className={`${adminButtonClass("primary")} flex-1 sm:flex-none`}>
              Call
            </a>
            <a
              href={`https://wa.me/${waPhone}`}
              target="_blank"
              rel="noreferrer"
              className={`${adminButtonClass("secondary")} flex-1 sm:flex-none`}
            >
              WhatsApp
            </a>
          </div>
        </div>
      </AdminCard>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Stat label="Orders" value={String(customer.orders.length)} />
        <Stat label="Confirmed sales" value={formatKes(confirmedTotal)} />
        <Stat
          label="Open requests"
          value={String(openEnquiries.length)}
          warn={openEnquiries.length > 0}
        />
      </div>

      {openEnquiries.length > 0 ? (
        <AdminCard title="Needs attention" className="mb-4" description="New order requests still waiting.">
          <ul className="space-y-2">
            {openEnquiries.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-sand bg-sand/40 px-3.5 py-3 transition hover:border-teal/30"
                >
                  <span>
                    <span className="font-semibold text-teal">{order.orderNumber}</span>
                    <span className="mt-0.5 block text-xs text-navy/50">
                      {formatAdminRelativeTime(order.createdAt)}
                    </span>
                  </span>
                  <span className="text-sm font-semibold text-navy">Process →</span>
                </Link>
              </li>
            ))}
          </ul>
        </AdminCard>
      ) : null}

      <AdminCard title="Order history">
        {customer.orders.length === 0 ? (
          <AdminEmpty>No orders yet.</AdminEmpty>
        ) : (
          <ul className="divide-y divide-navy/8">
            {customer.orders.map((order) => {
              const itemSummary =
                order.items.length === 0
                  ? "—"
                  : order.items.length === 1
                    ? `${order.items[0].name} × ${order.items[0].quantity}`
                    : `${order.items[0].name} + ${order.items.length - 1} more`;
              return (
                <li
                  key={order.id}
                  className="flex flex-col gap-2 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-semibold text-teal hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                    <p className="mt-0.5 text-xs text-navy/50">
                      {formatAdminDateTime(order.createdAt)}
                    </p>
                    <p className="mt-1 truncate text-sm text-navy/65">{itemSummary}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                    <AdminBadge tone={orderBadgeTone(order.status)}>
                      {orderStatusLabel(order.status)}
                    </AdminBadge>
                    <p className="text-sm font-semibold tabular-nums text-navy">
                      {formatKes(order.totalKes)}
                    </p>
                    <p className="text-xs text-navy/45">
                      {paymentStatusLabel(order.payment?.status ?? "UNPAID")}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </AdminCard>

      <div className="mt-4">
        <Link href="/admin/sales/new" className={`${adminButtonClass("secondary")} w-full sm:w-auto`}>
          Record a sale
        </Link>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  warn = false,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(22,52,76,0.04),0_8px_24px_rgba(22,52,76,0.04)] ${
        warn ? "border-coral/30" : "border-navy/8"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-navy/45">{label}</p>
      <p
        className={`mt-1.5 text-xl font-semibold tabular-nums tracking-tight ${
          warn ? "text-coral" : "text-navy"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
