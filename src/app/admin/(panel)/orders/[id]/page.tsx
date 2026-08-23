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
import { formatDisplayPhone } from "@/lib/phone";
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

  return (
    <div className="min-w-0 w-full max-w-3xl">
      <AdminPageHeader
        title={order.orderNumber}
        backHref="/admin/orders"
        backLabel="Orders"
        meta={formatAdminDateTime(order.createdAt)}
      />

      <OrderStatusSummary
        status={order.status}
        paymentStatus={order.payment?.status ?? "UNPAID"}
        deliveryStatus={order.delivery?.status ?? "PENDING"}
        deliveryAddress={deliveryAddress}
        deliveryZone={order.delivery?.zone}
      />

      {isEnquiry ? (
        <div className="mt-4">
          <AdminNotice tone="info">
            Call the customer to confirm availability{pickup ? "" : " and quote delivery"}, then
            confirm the sale.
          </AdminNotice>
        </div>
      ) : null}
      {order.refundRequired ? (
        <div className="mt-4">
          <AdminNotice tone="warn">
            This confirmed order was paid and then cancelled. Stock was put back. A refund may need
            to be handled by hand.
          </AdminNotice>
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <AdminCard title="Customer">
          <p className="text-lg font-semibold text-navy">{order.customer.name}</p>
          <p className="mt-1 text-navy/70">{formatDisplayPhone(order.customer.phone)}</p>
          {order.customer.email ? <p className="text-navy/70">{order.customer.email}</p> : null}
          <a href={`tel:${order.customer.phone}`} className={`${adminButtonClass("primary")} mt-4`}>
            Call customer
          </a>
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
          <p className="text-sm text-navy/65">{orderFulfillmentLabel(deliveryAddress, order.delivery?.zone)}</p>
          <p className="mt-2 text-sm text-navy/85">
            {pickup ? pickupAddressDisplay(deliveryAddress) : deliveryAddress}
          </p>
          {order.delivery?.failureReason ? (
            <p className="mt-3 text-sm text-coral">Last failure: {order.delivery.failureReason}</p>
          ) : null}
        </AdminCard>
      </div>

      {isEnquiry ? (
        <EnquiryEditor
          orderId={order.id}
          items={order.items}
          notes={order.notes ?? ""}
          paymentMethod={order.payment?.method ?? "OTHER"}
          deliveryFeeKes={order.deliveryFeeKes}
          products={products}
          pickup={pickup}
        />
      ) : (
        <AdminCard title="Items" className="mt-4">
          <ul className="space-y-2 text-sm">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3 border-b border-navy/6 py-2 last:border-0">
                <span>
                  {item.name}
                  <span className="block text-navy/50">
                    {item.quantity} × {formatKes(item.unitPriceKes)}
                  </span>
                </span>
                <span className="tabular-nums font-medium">{formatKes(item.lineTotalKes)}</span>
              </li>
            ))}
            <li className="flex justify-between border-t border-navy/8 pt-3">
              <span className="text-navy/65">Delivery</span>
              <span>{order.deliveryFeeKes ? formatKes(order.deliveryFeeKes) : "—"}</span>
            </li>
            <li className="flex justify-between pt-1 text-base font-semibold">
              <span>Total</span>
              <span>{formatKes(order.totalKes)}</span>
            </li>
          </ul>
        </AdminCard>
      )}

      {!isEnquiry && order.notes ? (
        <AdminCard title="Notes" className="mt-4">
          <p className="whitespace-pre-wrap text-sm text-navy/80">{order.notes}</p>
        </AdminCard>
      ) : null}

      {!isEnquiry ? (
        <AdminCard title="Payment" className="mt-4">
          <p className="text-sm">
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
      />

      <AdminCard title="Activity" className="mt-6">
        <OrderTimeline events={order.events} />
      </AdminCard>
    </div>
  );
}
