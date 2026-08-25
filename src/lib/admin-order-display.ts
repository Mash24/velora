import { formatKes } from "./format";

import { BUSINESS } from "./constants";

type OrderItem = { name: string; quantity: number };

type OrderListRow = {
  status: string;
  subtotalKes: number;
  deliveryFeeKes: number;
  totalKes: number;
  delivery?: { address: string; status: string; zone: string } | null;
};

export function shopPickupAddress() {
  return `Shop pickup · ${BUSINESS.location} · ${BUSINESS.landmark}`;
}

export function isShopPickup(address?: string | null) {
  return address?.startsWith("Shop pickup") ?? false;
}

export function orderItemsSummary(items: OrderItem[]) {
  if (items.length === 0) return "—";
  if (items.length === 1) return `${items[0].name} × ${items[0].quantity}`;
  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
  return `${items[0].name} + ${items.length - 1} more · ${totalQty} units`;
}

export function orderFulfillmentLabel(address?: string | null, zone?: string) {
  if (isShopPickup(address)) return "Shop pickup";
  return zone === "UPCOUNTRY" ? "Delivery · outside Nairobi" : "Delivery · Nairobi";
}

export function orderDeliveryListLabel(order: OrderListRow) {
  const address = order.delivery?.address;
  const status = order.delivery?.status ?? "PENDING";

  if (isShopPickup(address)) {
    if (order.status === "ENQUIRY") return "Shop pickup";
    if (status === "DELIVERED") return "Collected";
    return "Shop pickup";
  }

  if (order.status === "ENQUIRY") return "Delivery to confirm";

  const labels: Record<string, string> = {
    PENDING: "Not sent out yet",
    ASSIGNED: "Assigned",
    OUT_FOR_DELIVERY: "Out for delivery",
    DELIVERED: "Delivered",
    FAILED: "Delivery failed",
  };
  return labels[status] ?? status;
}

export function orderListTotalLabel(order: OrderListRow) {
  if (order.status === "ENQUIRY" && order.deliveryFeeKes === 0) {
    return `Est. ${formatKes(order.subtotalKes)}`;
  }
  return formatKes(order.totalKes);
}

export function pickupAddressDisplay(address: string) {
  return address.replace(/^Shop pickup · /, "");
}
