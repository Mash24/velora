import { normalizeKenyanPhone, isUsablePhone } from "@/lib/phone";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const orderNumber = String(body.orderNumber ?? "").trim();
  const phone = normalizeKenyanPhone(String(body.phone ?? "").trim());

  if (!orderNumber || !isUsablePhone(phone)) {
    return NextResponse.json(
      { error: "Enter your order number and phone number." },
      { status: 400 },
    );
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { customer: true, items: true, payment: true, delivery: true },
  });

  if (!order || normalizeKenyanPhone(order.customer.phone) !== phone) {
    return NextResponse.json(
      { error: "We could not find an order with those details." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    order: {
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
    },
  });
}
