import { AdminBadge, adminButtonClass } from "@/components/admin/ui";
import { InventoryReceiveButton } from "@/components/admin/InventoryReceiveButton";
import {
  orderDeliveryListLabel,
  orderFulfillmentLabel,
  orderItemsSummary,
  orderListTotalLabel,
} from "@/lib/admin-order-display";
import { formatAdminRelativeTime } from "@/lib/admin-period";
import { formatKes } from "@/lib/format";
import { orderStatusLabel, paymentStatusLabel } from "@/lib/labels";
import { formatDisplayPhone } from "@/lib/phone";
import Link from "next/link";
import type { ReactNode } from "react";

type OrderRow = {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: Date;
  subtotalKes: number;
  deliveryFeeKes: number;
  totalKes: number;
  refundRequired: boolean;
  customer: { name: string; phone: string };
  payment: { status: string } | null;
  delivery: { address: string; zone: string; status: string } | null;
  items: { name: string; quantity: number }[];
};

export function AdminOrdersMobileList({
  orders,
  statusTone,
}: {
  orders: OrderRow[];
  statusTone: (status: string) => "sand" | "teal" | "navy" | "coral" | "neutral";
}) {
  return (
    <ul className="admin-table-mobile divide-y divide-navy/8">
      {orders.map((order) => {
        const isNew = order.status === "ENQUIRY";
        return (
          <li key={order.id} className={`p-4 ${isNew ? "bg-sand/30" : ""}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="break-anywhere font-semibold text-teal"
                  >
                    {order.orderNumber}
                  </Link>
                  <span className="text-xs text-navy/45">{formatAdminRelativeTime(order.createdAt)}</span>
                </div>
                <p className="mt-1 break-anywhere font-medium text-navy">{order.customer.name}</p>
                <p className="text-sm text-navy/65">{formatDisplayPhone(order.customer.phone)}</p>
              </div>
              <p className="shrink-0 text-sm font-semibold tabular-nums text-navy">
                {orderListTotalLabel(order)}
              </p>
            </div>

            <p className="mt-2 text-sm text-navy/70">{orderItemsSummary(order.items)}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              <AdminBadge tone={statusTone(order.status)}>
                {orderStatusLabel(order.status as never)}
              </AdminBadge>
              <AdminBadge tone={order.payment?.status === "PAID" ? "teal" : "coral"}>
                {paymentStatusLabel((order.payment?.status as never) ?? "UNPAID")}
              </AdminBadge>
            </div>

            <p className="mt-2 text-sm text-navy/75">{orderDeliveryListLabel(order)}</p>
            <p className="text-xs text-navy/55">
              {orderFulfillmentLabel(order.delivery?.address, order.delivery?.zone)}
            </p>
            {order.refundRequired ? (
              <p className="mt-2 text-xs font-medium text-coral">Refund may be needed</p>
            ) : null}

            <Link
              href={`/admin/orders/${order.id}`}
              className={`${adminButtonClass(isNew ? "primary" : "secondary")} mt-3 w-full`}
            >
              {isNew ? "Process this order" : "Open order"}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function AdminInventoryMobileList({
  items,
}: {
  items: {
    id: string;
    name: string;
    categoryName: string;
    stockQuantity: number;
    stockUnit: string;
    reorderThreshold: number;
    status: string;
    statusTone: "teal" | "sand" | "coral";
    lastMovement: ReactNode;
  }[];
}) {
  return (
    <ul className="admin-table-mobile divide-y divide-navy/8">
      {items.map((item) => {
        const urgent = item.status === "Out" || item.status === "Low";
        return (
          <li
            key={item.id}
            className={`p-4 ${item.status === "Out" ? "bg-coral/[0.04]" : item.status === "Low" ? "bg-sand/30" : ""}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  href={`/admin/products/${item.id}`}
                  className="break-anywhere font-semibold text-teal"
                >
                  {item.name}
                </Link>
                <p className="mt-0.5 text-xs text-navy/55">{item.categoryName}</p>
              </div>
              <AdminBadge tone={item.statusTone}>
                {item.status === "Out" ? "Out of stock" : item.status === "Low" ? "Low stock" : "OK"}
              </AdminBadge>
            </div>

            <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight text-navy">
              {item.stockQuantity}
              <span className="ml-1.5 text-sm font-medium text-navy/55">{item.stockUnit}</span>
            </p>
            <p className="mt-0.5 text-xs text-navy/50">Alert at ≤ {item.reorderThreshold}</p>
            <p className="mt-2 text-xs text-navy/60">{item.lastMovement}</p>

            <div className="mt-3 space-y-2">
              <InventoryReceiveButton productId={item.id} stockUnit={item.stockUnit} />
              <Link
                href={`/admin/products/${item.id}`}
                className={`${adminButtonClass("secondary")} w-full`}
              >
                {urgent ? "Correct / details" : "Open product"}
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function AdminCustomersMobileList({
  customers,
}: {
  customers: {
    id: string;
    name: string;
    phone: string;
    sourceLabel: string;
    orderCount: number;
    confirmedTotal: number;
    lastOrderLabel?: string;
  }[];
}) {
  return (
    <ul className="admin-table-mobile divide-y divide-navy/8">
      {customers.map((customer) => (
        <li key={customer.id} className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                href={`/admin/customers/${customer.id}`}
                className="break-anywhere font-semibold text-teal"
              >
                {customer.name}
              </Link>
              <p className="mt-1 text-sm tabular-nums text-navy/75">{customer.phone}</p>
              <p className="mt-1 text-xs text-navy/50">{customer.sourceLabel}</p>
            </div>
            <p className="shrink-0 text-sm font-semibold tabular-nums text-navy">
              {formatKes(customer.confirmedTotal)}
            </p>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div>
              <dt className="text-navy/55">Orders</dt>
              <dd className="font-medium tabular-nums">{customer.orderCount}</dd>
            </div>
            <div>
              <dt className="text-navy/55">Last order</dt>
              <dd className="font-medium text-navy/80">{customer.lastOrderLabel ?? "—"}</dd>
            </div>
          </dl>
          <Link
            href={`/admin/customers/${customer.id}`}
            className={`${adminButtonClass("secondary")} mt-3 w-full`}
          >
            Open customer
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function AdminProductsMobileList({
  products,
}: {
  products: {
    id: string;
    name: string;
    imageUrl?: string | null;
    categoryLabel: string;
    priceLabel: string;
    stockLabel: string;
    lowStock?: boolean;
    visible: boolean;
    statusLabel?: string;
    statusTone?: "teal" | "sand" | "coral" | "neutral";
  }[];
}) {
  return (
    <ul className="admin-table-mobile divide-y divide-navy/8">
      {products.map((product) => (
        <li key={product.id} className="p-4">
          <div className="flex gap-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-mist/70">
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-[9px] font-semibold uppercase tracking-wider text-navy/35">
                  No photo
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/admin/products/${product.id}`}
                className="break-anywhere font-semibold text-teal"
              >
                {product.name}
              </Link>
              <p className="mt-0.5 text-xs text-navy/55">{product.categoryLabel}</p>
              <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-navy/55">Price</dt>
                  <dd className="font-medium tabular-nums text-navy">{product.priceLabel}</dd>
                </div>
                <div>
                  <dt className="text-navy/55">Stock</dt>
                  <dd className="font-medium tabular-nums text-navy">
                    {product.stockLabel}
                    {product.lowStock ? (
                      <span className="mt-0.5 block text-xs font-medium text-coral">Low</span>
                    ) : null}
                  </dd>
                </div>
              </dl>
              <div className="mt-2">
                <AdminBadge
                  tone={
                    product.statusTone ?? (product.visible ? "teal" : "neutral")
                  }
                >
                  {product.statusLabel ?? (product.visible ? "In the shop" : "Hidden")}
                </AdminBadge>
              </div>
            </div>
          </div>
          <Link
            href={`/admin/products/${product.id}`}
            className={`${adminButtonClass(
              product.statusLabel === "Needs a photo" ? "primary" : "secondary",
            )} mt-3 w-full`}
          >
            {product.statusLabel === "Needs a photo" ? "Add photo" : "Open"}
          </Link>
        </li>
      ))}
    </ul>
  );
}
