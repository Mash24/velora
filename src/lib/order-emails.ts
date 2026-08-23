import { BUSINESS } from "./constants";
import { customerOrderSummary, customerOrderTotalLabel } from "./customer-order-status";
import { formatKes } from "./format";
import { sendEmail } from "./email";
import { emailFromAddress } from "./email-config";
import { siteUrl } from "./site-url";

export type OrderEmailEvent =
  | "received"
  | "confirmed"
  | "cancelled"
  | "paid"
  | "processing"
  | "out_for_delivery"
  | "delivered"
  | "delivery_failed"
  | "completed";

type OrderEmailData = {
  orderNumber: string;
  status: string;
  subtotalKes: number;
  deliveryFeeKes: number;
  totalKes: number;
  customer: { name: string; email: string };
  items: { name: string; quantity: number; lineTotalKes: number }[];
  payment?: { status: string } | null;
  delivery?: { status: string; address: string } | null;
};

const eventCopy: Record<OrderEmailEvent, { subject: (n: string) => string; lead: () => string }> = {
  received: {
    subject: (n) => `We received your order request ${n}`,
    lead: () =>
      "Thank you for your order request. We will contact you to confirm availability and your final total before payment.",
  },
  confirmed: {
    subject: (n) => `Your order ${n} is confirmed`,
    lead: () => "Your order is confirmed. Here is a summary of what you ordered.",
  },
  cancelled: {
    subject: (n) => `Update on order ${n}`,
    lead: () => "Your order has been cancelled. Contact us if you have any questions.",
  },
  paid: {
    subject: (n) => `Payment received for order ${n}`,
    lead: () => "We have recorded your payment. Thank you.",
  },
  processing: {
    subject: (n) => `Your order ${n} is being prepared`,
    lead: () => "We are preparing your order.",
  },
  out_for_delivery: {
    subject: (n) => `Your order ${n} is on the way`,
    lead: () => "Your order is out for delivery.",
  },
  delivered: {
    subject: (n) => `Your order ${n} has been delivered`,
    lead: () => "Your order has been delivered. Thank you for shopping with Velora.",
  },
  delivery_failed: {
    subject: (n) => `Delivery update for order ${n}`,
    lead: () => "We could not complete delivery as planned. We will contact you to arrange the next step.",
  },
  completed: {
    subject: (n) => `Order ${n} completed`,
    lead: () => "Your order is complete. Thank you for choosing Velora Medical Supplies.",
  },
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildOrderEmailHtml(order: OrderEmailData, event: OrderEmailEvent) {
  const copy = eventCopy[event];
  const trackUrl = `${siteUrl()}/track-order?order=${encodeURIComponent(order.orderNumber)}`;
  const summary = customerOrderSummary(order);
  const total = customerOrderTotalLabel(order);
  const from = emailFromAddress();

  const itemRows = order.items
    .map(
      (item) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #e8e4dc;">${escapeHtml(item.name)} × ${item.quantity}</td><td style="padding:8px 0;border-bottom:1px solid #e8e4dc;text-align:right;">${escapeHtml(formatKes(item.lineTotalKes))}</td></tr>`,
    )
    .join("");

  const statusRows = summary
    .map(
      (row) =>
        `<tr><td style="padding:6px 0;color:#5a7082;">${escapeHtml(row.label)}</td><td style="padding:6px 0;text-align:right;font-weight:600;">${escapeHtml(row.value)}</td></tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<body style="margin:0;background:#f5f1ea;font-family:Georgia,'Times New Roman',serif;color:#16344c;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="background:#16344c;color:#f5f1ea;padding:24px;border-radius:16px 16px 0 0;">
      <p style="margin:0;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;opacity:0.75;">${escapeHtml(BUSINESS.name)}</p>
      <h1 style="margin:12px 0 0;font-size:22px;font-weight:600;">${escapeHtml(copy.subject(order.orderNumber))}</h1>
    </div>
    <div style="background:#ffffff;padding:24px;border-radius:0 0 16px 16px;border:1px solid #e8e4dc;border-top:0;">
      <p style="margin:0 0 16px;line-height:1.6;">Hello ${escapeHtml(order.customer.name)},</p>
      <p style="margin:0 0 20px;line-height:1.6;">${escapeHtml(copy.lead())}</p>
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#2a8f8f;">Order ${escapeHtml(order.orderNumber)}</p>
      <table style="width:100%;border-collapse:collapse;margin:0 0 16px;font-size:14px;">${itemRows}</table>
      <table style="width:100%;border-collapse:collapse;margin:0 0 8px;font-size:14px;">${statusRows}</table>
      <p style="margin:16px 0 0;font-size:14px;"><strong>${escapeHtml(total.label)}:</strong> ${escapeHtml(total.amount)}</p>
      <p style="margin:24px 0;">
        <a href="${trackUrl}" style="display:inline-block;background:#16344c;color:#f5f1ea;text-decoration:none;padding:12px 20px;border-radius:999px;font-size:14px;font-weight:600;">Track your order</a>
      </p>
      <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#5a7082;">
        Questions? Reply to this email or call us on ${escapeHtml(BUSINESS.phoneDisplay)}.
      </p>
      <p style="margin:16px 0 0;font-size:12px;color:#8a9aaa;">
        ${escapeHtml(from.name)} · ${escapeHtml(BUSINESS.location)}
      </p>
    </div>
  </div>
</body>
</html>`;
}

function buildOrderEmailText(order: OrderEmailData, event: OrderEmailEvent) {
  const copy = eventCopy[event];
  const trackUrl = `${siteUrl()}/track-order?order=${encodeURIComponent(order.orderNumber)}`;
  const total = customerOrderTotalLabel(order);
  const items = order.items.map((item) => `${item.name} × ${item.quantity} — ${formatKes(item.lineTotalKes)}`).join("\n");
  const summary = customerOrderSummary(order)
    .map((row) => `${row.label}: ${row.value}`)
    .join("\n");

  return [
    copy.subject(order.orderNumber),
    "",
    `Hello ${order.customer.name},`,
    "",
    copy.lead(),
    "",
    `Order ${order.orderNumber}`,
    items,
    "",
    summary,
    `${total.label}: ${total.amount}`,
    "",
    `Track your order: ${trackUrl}`,
    "",
    `Questions? Call ${BUSINESS.phoneDisplay}.`,
  ].join("\n");
}

export async function sendOrderStatusEmail(order: OrderEmailData, event: OrderEmailEvent) {
  const copy = eventCopy[event];
  return sendEmail({
    to: order.customer.email,
    subject: copy.subject(order.orderNumber),
    html: buildOrderEmailHtml(order, event),
    text: buildOrderEmailText(order, event),
  });
}
