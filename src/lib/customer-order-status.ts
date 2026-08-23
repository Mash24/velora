import { isShopPickup } from "./admin-order-display";
import { formatKes } from "./format";
import { orderStatusLabel, paymentStatusLabel } from "./labels";

type OrderSnapshot = {
  orderNumber: string;
  status: string;
  subtotalKes: number;
  deliveryFeeKes: number;
  totalKes: number;
  payment?: { status: string } | null;
  delivery?: { status: string; address: string } | null;
};

export function customerOrderHeadline(status: string) {
  const labels: Record<string, string> = {
    ENQUIRY: "Request received",
    CONFIRMED: "Order confirmed",
    PROCESSING: "Being prepared",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };
  return labels[status] ?? orderStatusLabel(status);
}

export function customerOrderSummary(order: OrderSnapshot) {
  const pickup = isShopPickup(order.delivery?.address);
  const lines = [
    { label: "Order status", value: customerOrderHeadline(order.status) },
    { label: "Payment", value: paymentStatusLabel(order.payment?.status ?? "UNPAID") },
  ];

  if (order.status === "CANCELLED") return lines;

  if (pickup) {
    lines.push({ label: "Pickup", value: "Collect from our shop" });
  } else if (order.delivery) {
    const deliveryLabels: Record<string, string> = {
      PENDING: "Delivery to be arranged",
      ASSIGNED: "Delivery being arranged",
      OUT_FOR_DELIVERY: "On the way",
      DELIVERED: "Delivered",
      FAILED: "Delivery issue — we will contact you",
    };
    lines.push({
      label: "Delivery",
      value: deliveryLabels[order.delivery.status] ?? order.delivery.status,
    });
  }

  return lines;
}

export function customerOrderTotalLabel(order: OrderSnapshot) {
  if (order.status === "ENQUIRY" && order.deliveryFeeKes === 0) {
    return { label: "Estimated product total", amount: formatKes(order.subtotalKes) };
  }
  return { label: "Total", amount: formatKes(order.totalKes) };
}
