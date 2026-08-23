import { AdminBadge, adminButtonClass } from "@/components/admin/ui";
import {
  orderDeliveryListLabel,
  orderFulfillmentLabel,
  orderListTotalLabel,
} from "@/lib/admin-order-display";
import { formatKes } from "@/lib/format";
import { orderStatusLabel, paymentStatusLabel } from "@/lib/labels";
import { formatDisplayPhone } from "@/lib/phone";
import Link from "next/link";
import type { ReactNode } from "react";

type OrderRow = {
  id: string;
  orderNumber: string;
  status: string;
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
      {orders.map((order) => (
        <li key={order.id} className={`p-4 ${order.status === "ENQUIRY" ? "bg-sand/35" : ""}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link href={`/admin/orders/${order.id}`} className="break-anywhere font-semibold text-teal">
                {order.orderNumber}
              </Link>
              <p className="mt-1 break-anywhere font-medium text-navy">{order.customer.name}</p>
              <p className="text-sm text-navy/65">{formatDisplayPhone(order.customer.phone)}</p>
            </div>
            <p className="shrink-0 text-sm font-semibold tabular-nums text-navy">
              {orderListTotalLabel(order)}
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <AdminBadge tone={statusTone(order.status)}>
              {orderStatusLabel(order.status as never)}
            </AdminBadge>
            <AdminBadge tone={order.payment?.status === "PAID" ? "teal" : "coral"}>
              {paymentStatusLabel(order.payment?.status as never ?? "UNPAID")}
            </AdminBadge>
          </div>
          <p className="mt-2 text-sm text-navy/75">{orderDeliveryListLabel(order)}</p>
          <p className="text-xs text-navy/55">
            {orderFulfillmentLabel(order.delivery?.address, order.delivery?.zone)}
          </p>
          {order.refundRequired ? (
            <p className="mt-2 text-xs font-medium text-coral">Refund may be required</p>
          ) : null}
          <Link
            href={`/admin/orders/${order.id}`}
            className={`${adminButtonClass("secondary")} mt-3 w-full`}
          >
            View order
          </Link>
        </li>
      ))}
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
      {items.map((item) => (
        <li key={item.id} className="p-4">
          <Link href={`/admin/products/${item.id}`} className="break-anywhere font-semibold text-teal">
            {item.name}
          </Link>
          <p className="mt-1 text-sm text-navy/65">{item.categoryName}</p>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div>
              <dt className="text-navy/55">On shelf</dt>
              <dd className="font-medium tabular-nums text-navy">
                {item.stockQuantity} {item.stockUnit}
              </dd>
            </div>
            <div>
              <dt className="text-navy/55">Alert at</dt>
              <dd className="font-medium tabular-nums text-navy">{item.reorderThreshold}</dd>
            </div>
          </dl>
          <div className="mt-2">
            <AdminBadge tone={item.statusTone}>
              {item.status === "Out" ? "Out of stock" : item.status}
            </AdminBadge>
          </div>
          <p className="mt-2 text-xs text-navy/60">{item.lastMovement}</p>
          <Link
            href={`/admin/products/${item.id}`}
            className={`${adminButtonClass("secondary")} mt-3 w-full`}
          >
            View product
          </Link>
        </li>
      ))}
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
  }[];
}) {
  return (
    <ul className="admin-table-mobile divide-y divide-navy/8">
      {customers.map((customer) => (
        <li key={customer.id} className="p-4">
          <Link
            href={`/admin/customers/${customer.id}`}
            className="break-anywhere font-semibold text-teal"
          >
            {customer.name}
          </Link>
          <p className="mt-1 text-sm text-navy/75">{customer.phone}</p>
          <p className="mt-2 text-sm text-navy/65">{customer.sourceLabel}</p>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div>
              <dt className="text-navy/55">Orders</dt>
              <dd className="font-medium tabular-nums">{customer.orderCount}</dd>
            </div>
            <div>
              <dt className="text-navy/55">Confirmed sales</dt>
              <dd className="font-medium tabular-nums">{formatKes(customer.confirmedTotal)}</dd>
            </div>
          </dl>
          <Link
            href={`/admin/customers/${customer.id}`}
            className={`${adminButtonClass("secondary")} mt-3 w-full`}
          >
            View customer
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
    categoryLabel: string;
    priceLabel: string;
    stockLabel: string;
    visible: boolean;
  }[];
}) {
  return (
    <ul className="admin-table-mobile divide-y divide-navy/8">
      {products.map((product) => (
        <li key={product.id} className="p-4">
          <Link href={`/admin/products/${product.id}`} className="break-anywhere font-semibold text-teal">
            {product.name}
          </Link>
          <p className="mt-1 text-xs text-navy/55">{product.categoryLabel}</p>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div>
              <dt className="text-navy/55">Price</dt>
              <dd className="font-medium tabular-nums">{product.priceLabel}</dd>
            </div>
            <div>
              <dt className="text-navy/55">Stock</dt>
              <dd className="font-medium tabular-nums">{product.stockLabel}</dd>
            </div>
          </dl>
          <div className="mt-2">
            <AdminBadge tone={product.visible ? "teal" : "neutral"}>
              {product.visible ? "In the shop" : "Hidden"}
            </AdminBadge>
          </div>
          <Link
            href={`/admin/products/${product.id}`}
            className={`${adminButtonClass("secondary")} mt-3 w-full`}
          >
            Edit product
          </Link>
        </li>
      ))}
    </ul>
  );
}
