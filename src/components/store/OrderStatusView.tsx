import { isShopPickup, pickupAddressDisplay } from "@/lib/admin-order-display";
import { customerOrderHeadline, customerOrderSummary, customerOrderTotalLabel } from "@/lib/customer-order-status";
import { formatKes } from "@/lib/format";
import { formatDisplayPhone } from "@/lib/phone";

export type PublicOrderView = {
  orderNumber: string;
  status: string;
  subtotalKes: number;
  deliveryFeeKes: number;
  totalKes: number;
  customer: { name: string; phone: string };
  items: { name: string; quantity: number; lineTotalKes: number }[];
  payment?: { status: string } | null;
  delivery?: { status: string; address: string } | null;
};

export function OrderStatusView({ order }: { order: PublicOrderView }) {
  const pickup = isShopPickup(order.delivery?.address);
  const summary = customerOrderSummary(order);
  const total = customerOrderTotalLabel(order);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-navy/10 bg-white p-5">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-teal">Order {order.orderNumber}</p>
        <h2 className="mt-2 text-2xl font-semibold">{customerOrderHeadline(order.status)}</h2>
        <p className="mt-2 text-sm text-navy/70">
          {order.customer.name} · {formatDisplayPhone(order.customer.phone)}
        </p>
        <dl className="mt-4 space-y-2 border-t border-navy/10 pt-4 text-sm">
          {summary.map((row) => (
            <div key={row.label} className="flex justify-between gap-4">
              <dt className="text-navy/70">{row.label}</dt>
              <dd className="font-medium text-navy">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <section>
        <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-teal">Products</h3>
        <ul className="mt-3 space-y-2 rounded-2xl border border-navy/10 bg-white p-5">
          {order.items.map((item, index) => (
            <li key={`${item.name}-${index}`} className="flex justify-between gap-4 text-sm">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span className="shrink-0">{formatKes(item.lineTotalKes)}</span>
            </li>
          ))}
          <li className="flex justify-between gap-4 border-t border-navy/10 pt-3 text-sm font-medium">
            <span>{total.label}</span>
            <span>{total.amount}</span>
          </li>
        </ul>
      </section>

      {order.delivery ? (
        <section>
          <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-teal">
            {pickup ? "Pickup" : "Delivery"}
          </h3>
          <p className="mt-3 rounded-2xl border border-navy/10 bg-white p-5 text-sm text-navy/80">
            {pickup ? pickupAddressDisplay(order.delivery.address) : order.delivery.address}
          </p>
        </section>
      ) : null}

      {order.status === "ENQUIRY" ? (
        <p className="text-sm text-navy/70">We&apos;ll be in touch about payment and delivery.</p>
      ) : null}
    </div>
  );
}
