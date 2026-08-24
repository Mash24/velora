import { OrderStatusView } from "@/components/store/OrderStatusView";
import { prisma } from "@/lib/prisma";
import { orderWhatsappMessage, whatsappLink } from "@/lib/whatsapp";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Order request received",
  robots: { index: false, follow: false },
};

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true, delivery: true, customer: true, payment: true },
  });

  if (!order) notFound();

  const isPickup = order.delivery?.address.startsWith("Shop pickup") ?? false;
  const deliveryArea = isPickup
    ? "Shop pickup"
    : order.delivery?.zone === "NAIROBI"
      ? "Nairobi delivery"
      : "Delivery outside Nairobi";
  const whatsappUrl = whatsappLink(
    orderWhatsappMessage(
      order.items.map((item) => `${item.name} × ${item.quantity}`),
      order.delivery?.address ?? "",
      deliveryArea,
      order.customer.name,
      order.orderNumber,
    ),
  );

  const trackHref = `/track-order?order=${encodeURIComponent(order.orderNumber)}`;

  return (
    <div className="site-container-narrow page-py min-w-0">
      <p className="text-xs uppercase tracking-[0.2em] text-teal">Order request received</p>
      <h1 className="mt-3 text-3xl font-semibold">Order request #{order.orderNumber}</h1>
      <p className="mt-4 text-navy/80">
        We&apos;ll contact you on <strong>{order.customer.phone}</strong> about payment and delivery.
      </p>
      {order.customer.email ? (
        <p className="mt-2 text-sm text-navy/70">
          We&apos;ve also sent a confirmation to <strong>{order.customer.email}</strong>. You&apos;ll
          get an email whenever your order status changes.
        </p>
      ) : null}

      <OrderStatusView
        order={{
          orderNumber: order.orderNumber,
          status: order.status,
          subtotalKes: order.subtotalKes,
          deliveryFeeKes: order.deliveryFeeKes,
          totalKes: order.totalKes,
          customer: { name: order.customer.name, phone: order.customer.phone },
          items: order.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            lineTotalKes: item.lineTotalKes,
          })),
          payment: order.payment ? { status: order.payment.status } : null,
          delivery: order.delivery
            ? { status: order.delivery.status, address: order.delivery.address }
            : null,
        }}
      />

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Link
          href={trackHref}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-navy px-5 py-3 text-sm font-medium text-cream"
        >
          Track this order
        </Link>
        <Link href="/shop" className="text-sm text-teal">
          Continue shopping
        </Link>
        <a href={whatsappUrl} className="text-sm text-teal">
          Prefer to talk? Chat with Velora on WhatsApp
        </a>
      </div>
    </div>
  );
}
