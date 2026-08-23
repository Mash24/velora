export function orderStatusLabel(status: string) {
  const labels: Record<string, string> = {
    ENQUIRY: "New order",
    CONFIRMED: "Confirmed",
    PROCESSING: "Processing",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };
  return labels[status] ?? status;
}

export function paymentStatusLabel(status: string) {
  const labels: Record<string, string> = {
    UNPAID: "Unpaid",
    PAID: "Paid",
    FAILED: "Failed",
    REFUNDED: "Refunded",
  };
  return labels[status] ?? status;
}

export function paymentMethodLabel(method: string) {
  const labels: Record<string, string> = {
    MPESA: "M-Pesa",
    CASH: "Cash",
    PAY_ON_DELIVERY: "Pay on delivery",
    OTHER: "Other",
  };
  return labels[method] ?? method;
}

export function deliveryZoneLabel(zone: string) {
  return zone === "UPCOUNTRY" ? "Outside Nairobi" : "Nairobi";
}

export function deliveryStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: "Not sent out yet",
    ASSIGNED: "Assigned",
    OUT_FOR_DELIVERY: "Out for delivery",
    DELIVERED: "Delivered",
    FAILED: "Delivery failed",
  };
  return labels[status] ?? status;
}

export function publicAvailability(stockQuantity: number, askForAvailability = false) {
  if (askForAvailability) return "Ask us";
  return stockQuantity > 0 ? "In stock" : "Out of stock";
}

export function inventoryMovementLabel(type: string) {
  const labels: Record<string, string> = {
    PURCHASE: "Received",
    SALE: "Sale",
    ADJUSTMENT: "Correction",
    RETURN: "Return",
    REVERSAL: "Stock put back",
  };
  return labels[type] ?? type;
}

export function availabilityTone(label: string) {
  if (label === "In stock") return "text-teal";
  if (label === "Ask us") return "text-navy/80";
  return "text-navy/60";
}
