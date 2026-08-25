import { EnquiryEditor } from "@/components/admin/EnquiryEditor";
import { OrderActions } from "@/components/admin/OrderActions";
import { OrderStatusSummary } from "@/components/admin/OrderStatusSummary";
import { OrderTimeline } from "@/components/admin/OrderTimeline";
import { AdminCard, AdminNotice, AdminPageHeader, adminButtonClass } from "@/components/admin/ui";
import { isShopPickup, orderFulfillmentLabel, pickupAddressDisplay } from "@/lib/admin-order-display";
import { formatAdminDateTime } from "@/lib/admin-period";
import { formatKes } from "@/lib/format";
import { paymentMethodLabel, paymentStatusLabel } from "@/lib/labels";
import { splitOrderNotes } from "@/lib/order-notes";
import { prisma } from "@/lib/prisma";
import { formatDisplayPhone, normalizeKenyanPhone } from "@/lib/phone";
import { sourceLabel } from "@/lib/source";
import { notFound } from "next/navigation";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [order, products] = await Promise.all([
    prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true,
        payment: true,
        delivery: true,
        events: { orderBy: { createdAt: "desc" } },
      },
    }),
    prisma.product.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, stockQuantity: true, priceKes: true },
    }),
  ]);
  if (!order) notFound();

  const pickup = isShopPickup(order.delivery?.address);
  const deliveryAddress = order.delivery?.address ?? "";
  const isEnquiry = order.status === "ENQUIRY";
  const { customerNote } = splitOrderNotes(order.notes);
  const waPhone = normalizeKenyanPhone(order.customer.phone).replace(/\D/g, "");

  return (
    <div className="min-w-0 w-full max-w-3xl">
      <AdminPageHeader
        title={order.orderNumber}
        backHref="/admin/orders"
        backLabel="Orders"
        meta={
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span>{formatAdminDateTime(order.createdAt)}</span>
            <span className="font-semibold tabular-nums text-navy">
              {isEnquiry && order.deliveryFeeKes === 0
                ? `Est. ${formatKes(order.subtotalKes)}`
                : formatKes(order.totalKes)}
            </span>
          </div>
        }
      />

      <OrderStatusSummary
        status={order.status}
        paymentStatus={order.payment?.status ?? "UNPAID"}
        deliveryStatus={order.delivery?.status ?? "PENDING"}
        deliveryAddress={deliveryAddress}
        deliveryZone={order.delivery?.zone}
      />

      {order.refundRequired ? (
        <div className="mt-4">
          <AdminNotice tone="warn">
            This confirmed order was paid and then cancelled. Stock was put back. A refund may need
            to be handled by hand.
          </AdminNotice>
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <AdminCard title="Customer">
          <p className="text-lg font-semibold text-navy">{order.customer.name}</p>
          <p className="mt-1 text-navy/70">{formatDisplayPhone(order.customer.phone)}</p>
          {order.customer.email ? <p className="text-navy/70">{order.customer.email}</p> : null}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <a href={`tel:${order.customer.phone}`} className={`${adminButtonClass("primary")} flex-1`}>
              Call
            </a>
            <a
              href={`https://wa.me/${waPhone}`}
              target="_blank"
              rel="noreferrer"
              className={`${adminButtonClass("secondary")} flex-1`}
            >
              WhatsApp
            </a>
          </div>
          <p className="mt-4 text-sm text-navy/50">Found us via {sourceLabel(order.source)}</p>
          {customerNote ? (
            <div className="mt-4 border-t border-navy/8 pt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-navy/45">
                Customer&apos;s note
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-navy/80">{customerNote}</p>
            </div>
          ) : null}
        </AdminCard>

        <AdminCard title={pickup ? "Pickup" : "Delivery"}>
          <p className="text-sm font-medium text-navy/80">
            {orderFulfillmentLabel(deliveryAddress, order.delivery?.zone)}
          </p>
          <p className="mt-2 text-sm leading-6 text-navy/85">
            {pickup ? pickupAddressDisplay(deliveryAddress) : deliveryAddress || "—"}
          </p>
          {order.delivery?.failureReason ? (
            <p className="mt-3 rounded-lg bg-coral/5 px-3 py-2 text-sm text-coral">
              Last failure: {order.delivery.failureReason}
            </p>
          ) : null}
        </AdminCard>
      </div>

      {isEnquiry ? (
        <EnquiryEditor
          orderId={order.id}
          customerPhone={order.customer.phone}
          items={order.items}
          notes={order.notes ?? ""}
          paymentMethod={order.payment?.method ?? "OTHER"}
          deliveryFeeKes={order.deliveryFeeKes}
          products={products}
          pickup={pickup}
        />
      ) : (
        <AdminCard title="Items" className="mt-4">
          <ul className="space-y-1 text-sm">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex justify-between gap-3 border-b border-navy/6 py-2.5 last:border-0"
              >
                <span className="min-w-0">
                  <span className="break-anywhere font-medium text-navy">{item.name}</span>
                  <span className="mt-0.5 block text-navy/50">
                    {item.quantity} × {formatKes(item.unitPriceKes)}
                  </span>
                </span>
                <span className="shrink-0 tabular-nums font-medium text-navy">
                  {formatKes(item.lineTotalKes)}
                </span>
              </li>
            ))}
            <li className="flex justify-between border-t border-navy/8 pt-3 text-navy/70">
              <span>Delivery</span>
              <span>{order.deliveryFeeKes ? formatKes(order.deliveryFeeKes) : "—"}</span>
            </li>
            <li className="flex justify-between pt-2 text-base font-semibold text-navy">
              <span>Total</span>
              <span className="tabular-nums">{formatKes(order.totalKes)}</span>
            </li>
          </ul>
        </AdminCard>
      )}

      {!isEnquiry && order.notes ? (
        <AdminCard title="Notes" className="mt-4">
          <p className="whitespace-pre-wrap text-sm leading-6 text-navy/80">{order.notes}</p>
        </AdminCard>
      ) : null}

      {!isEnquiry ? (
        <AdminCard title="Payment" className="mt-4">
          <p className="text-sm font-medium text-navy">
            {paymentMethodLabel(order.payment?.method ?? "OTHER")} ·{" "}
            {paymentStatusLabel(order.payment?.status ?? "UNPAID")}
          </p>
          {order.payment?.paidAt ? (
            <p className="mt-1 text-sm text-navy/55">Paid {formatAdminDateTime(order.payment.paidAt)}</p>
          ) : null}
        </AdminCard>
      ) : null}

      <OrderActions
        orderId={order.id}
        status={order.status}
        paymentStatus={order.payment?.status ?? "UNPAID"}
        deliveryStatus={order.delivery?.status ?? "PENDING"}
        totalKes={order.totalKes}
        pickup={pickup}
      />

      <AdminCard title="Activity" className="mt-6">
        <OrderTimeline events={order.events} />
      </AdminCard>
    </div>
  );
}
