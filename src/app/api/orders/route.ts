import { CustomerSource, DeliveryZone, InventoryMovementType, PaymentMethod, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { orderWhatsappMessage, whatsappLink } from "@/lib/whatsapp";

const sources = new Set(Object.values(CustomerSource));

function asSource(value: unknown): CustomerSource {
  if (typeof value === "string" && sources.has(value as CustomerSource)) {
    return value as CustomerSource;
  }
  return CustomerSource.WEBSITE;
}

export async function POST(request: Request) {
  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const address = String(body.address ?? "").trim();
  const notes = String(body.notes ?? "").trim();
  const zone = body.zone === "UPCOUNTRY" ? DeliveryZone.UPCOUNTRY : DeliveryZone.NAIROBI;
  const source = asSource(body.source);
  const items = Array.isArray(body.items) ? body.items : [];

  if (!name || !phone || !address || items.length === 0) {
    return NextResponse.json({ error: "Name, phone, address and items are required." }, { status: 400 });
  }

  const productIds = items.map((item: { productId?: string }) => String(item.productId ?? ""));
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  });
  const productMap = new Map(products.map((product) => [product.id, product]));

  const orderItems = items.map((item: { productId?: string; quantity?: number }) => {
    const product = productMap.get(String(item.productId));
    const quantity = Math.max(1, Number(item.quantity) || 1);
    if (!product) throw new Error("PRODUCT_NOT_FOUND");
    if (product.stockQuantity < quantity) throw new Error("OUT_OF_STOCK");
    return {
      product,
      quantity,
      unitPriceKes: product.priceKes,
      lineTotalKes: product.priceKes * quantity,
    };
  });

  const subtotalKes = orderItems.reduce((sum: number, item: { lineTotalKes: number }) => sum + item.lineTotalKes, 0);
  const deliveryFeeKes = 0;
  const totalKes = subtotalKes + deliveryFeeKes;
  const orderNumber = `VEL-${Date.now().toString(36).toUpperCase()}`;

  try {
    const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const customer = await tx.customer.create({
        data: { name, phone, location: address, source, type: "INDIVIDUAL" },
      });

      const created = await tx.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          source,
          status: "PENDING",
          subtotalKes,
          deliveryFeeKes,
          totalKes,
          notes: notes || null,
          items: {
            create: orderItems.map((item: (typeof orderItems)[number]) => ({
              productId: item.product.id,
              name: item.product.name,
              quantity: item.quantity,
              unitPriceKes: item.unitPriceKes,
              lineTotalKes: item.lineTotalKes,
            })),
          },
          payment: {
            create: {
              method: zone === DeliveryZone.NAIROBI ? PaymentMethod.CASH_ON_DELIVERY : PaymentMethod.MPESA,
              status: "UNPAID",
              amountKes: totalKes,
            },
          },
          delivery: {
            create: {
              zone,
              address,
              feeKes: deliveryFeeKes,
              status: "PENDING",
            },
          },
        },
        include: { items: true },
      });

      for (const item of orderItems) {
        await tx.product.update({
          where: { id: item.product.id },
          data: { stockQuantity: { decrement: item.quantity } },
        });
        await tx.inventoryMovement.create({
          data: {
            productId: item.product.id,
            type: InventoryMovementType.SALE,
            quantity: -item.quantity,
            reference: orderNumber,
          },
        });
      }

      return created;
    });

    const whatsappUrl = whatsappLink(
      orderWhatsappMessage(
        order.orderNumber,
        order.items.map((item) => `${item.name} × ${item.quantity}`),
        order.totalKes,
      ),
    );

    return NextResponse.json({ orderNumber: order.orderNumber, whatsappUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "OUT_OF_STOCK") {
      return NextResponse.json({ error: "Not enough stock for that quantity." }, { status: 400 });
    }
    if (message === "PRODUCT_NOT_FOUND") {
      return NextResponse.json({ error: "A selected product is no longer available." }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Could not record the order." }, { status: 500 });
  }
}
