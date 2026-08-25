import { orderDeliveryListLabel } from "@/lib/admin-order-display";
import { deliveryStatusLabel, orderStatusLabel, paymentStatusLabel } from "@/lib/labels";
import { AdminBadge } from "./ui";

function orderBadgeTone(status: string): "sand" | "teal" | "navy" | "neutral" | "coral" {
  if (status === "ENQUIRY") return "sand";
  if (status === "CONFIRMED" || status === "PROCESSING") return "teal";
  if (status === "COMPLETED") return "navy";
  if (status === "CANCELLED") return "coral";
  return "neutral";
}

function paymentBadgeTone(status: string): "coral" | "teal" | "neutral" {
  if (status === "UNPAID") return "coral";
  if (status === "PAID") return "teal";
  return "neutral";
}

export function OrderStatusSummary({
  status,
  paymentStatus,
  deliveryStatus,
  deliveryAddress,
  deliveryZone,
}: {
  status: string;
  paymentStatus: string;
  deliveryStatus: string;
  deliveryAddress?: string | null;
  deliveryZone?: string;
}) {
  const isEnquiry = status === "ENQUIRY";
  const fulfillmentValue = isEnquiry
    ? orderDeliveryListLabel({
        status,
        subtotalKes: 0,
        deliveryFeeKes: 0,
        totalKes: 0,
        delivery: { address: deliveryAddress ?? "", status: deliveryStatus, zone: deliveryZone ?? "NAIROBI" },
      })
    : deliveryStatusLabel(deliveryStatus);
  const isPickup = fulfillmentValue.toLowerCase().includes("pickup") || fulfillmentValue.toLowerCase().includes("collect");

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <AdminBadge tone={orderBadgeTone(status)}>{orderStatusLabel(status)}</AdminBadge>
      <AdminBadge tone={paymentBadgeTone(paymentStatus)}>{paymentStatusLabel(paymentStatus)}</AdminBadge>
      <AdminBadge tone="neutral">
        {isPickup ? "Pickup" : "Delivery"} · {fulfillmentValue}
      </AdminBadge>
    </div>
  );
}
