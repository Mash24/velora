import {
  CustomerSource,
  DeliveryStatus,
  DeliveryZone,
  InventoryMovementType,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
} from "@prisma/client";
import { logOrderEvent } from "./order-events";
import { notifyCustomerByEmail } from "./order-notifications";
import { normalizeKenyanPhone } from "./phone";
import { prisma } from "./prisma";
import { normalizeCustomerEmail } from "./customer-email";

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}

async function applyStockChange(
  tx: Prisma.TransactionClient,
  productId: string,
  quantity: number,
  type: InventoryMovementType,
  reference: string,
  reason?: string,
) {
  const product = await tx.product.update({
    where: { id: productId },
    data: { stockQuantity: { increment: quantity } },
  });

  if (product.stockQuantity < 0) {
    throw new DomainError(`Not enough stock for ${product.name}.`);
  }

  await tx.inventoryMovement.create({
    data: { productId, type, quantity, reference, reason: reason ?? null },
  });

  return product;
}

async function lockOrderRow(tx: Prisma.TransactionClient, orderId: string) {
  const rows = await tx.$queryRaw<Array<{ id: string }>>(
    Prisma.sql`SELECT id FROM "Order" WHERE id = ${orderId} FOR UPDATE`,
  );
  if (rows.length === 0) throw new DomainError("Order not found.");
}

async function syncOrderMoney(
  tx: Prisma.TransactionClient,
  orderId: string,
  deliveryFeeKes?: number,
) {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    include: { items: true, payment: true, delivery: true },
  });
  if (!order) throw new DomainError("Order not found.");

  const subtotalKes = order.items.reduce((sum, item) => sum + item.lineTotalKes, 0);
  const fee = deliveryFeeKes ?? order.deliveryFeeKes;
  const totalKes = subtotalKes + fee;

  await tx.order.update({
    where: { id: orderId },
    data: { subtotalKes, deliveryFeeKes: fee, totalKes },
  });
  if (order.payment) {
    await tx.payment.update({
      where: { id: order.payment.id },
      data: { amountKes: totalKes },
    });
  }
  if (order.delivery) {
    await tx.delivery.update({
      where: { id: order.delivery.id },
      data: { feeKes: fee },
    });
  }
}

export async function receiveStock(productId: string, quantity: number, reference: string) {
  if (quantity <= 0) throw new DomainError("Quantity must be more than zero.");

  return prisma.$transaction(async (tx) => {
    return applyStockChange(tx, productId, quantity, InventoryMovementType.PURCHASE, reference);
  });
}

export async function correctStock(
  productId: string,
  countedQuantity: number,
  reference: string,
  reason?: string,
) {
  if (countedQuantity < 0) throw new DomainError("Counted stock cannot be negative.");

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: productId } });
    if (!product) throw new DomainError("Product not found.");
    const delta = countedQuantity - product.stockQuantity;
    if (delta === 0) return product;
    return applyStockChange(
      tx,
      productId,
      delta,
      InventoryMovementType.ADJUSTMENT,
      reference,
      reason,
    );
  });
}

export async function confirmOrder(orderId: string) {
  const order = await prisma.$transaction(async (tx) => {
    await lockOrderRow(tx, orderId);
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) throw new DomainError("Order not found.");
    if (order.status !== OrderStatus.ENQUIRY) {
      throw new DomainError("Only a new order can be confirmed.");
    }
    if (order.items.length === 0) {
      throw new DomainError("Add at least one product before confirming.");
    }

    for (const item of order.items) {
      await applyStockChange(
        tx,
        item.productId,
        -item.quantity,
        InventoryMovementType.SALE,
        order.orderNumber,
      );
    }

    await syncOrderMoney(tx, orderId);

    const now = new Date();
    await logOrderEvent(tx, orderId, "Sale confirmed — stock taken off the shelf.");
    return tx.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CONFIRMED, confirmedAt: now },
    });
  });
  void notifyCustomerByEmail(orderId, "confirmed");
  return order;
}

export async function cancelOrder(orderId: string) {
  const order = await prisma.$transaction(async (tx) => {
    await lockOrderRow(tx, orderId);
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true, payment: true },
    });
    if (!order) throw new DomainError("Order not found.");
    if (order.status === OrderStatus.CANCELLED) return order;
    if (order.status === OrderStatus.COMPLETED) {
      throw new DomainError("A completed order cannot be cancelled here.");
    }

    const stockWasTaken =
      order.status === OrderStatus.CONFIRMED || order.status === OrderStatus.PROCESSING;

    if (stockWasTaken) {
      for (const item of order.items) {
        await applyStockChange(
          tx,
          item.productId,
          item.quantity,
          InventoryMovementType.REVERSAL,
          order.orderNumber,
        );
      }
    }

    const paid = order.payment?.status === PaymentStatus.PAID;
    const now = new Date();

    await logOrderEvent(
      tx,
      orderId,
      paid
        ? "Order cancelled. Stock put back. Payment was recorded — check if a refund is needed."
        : stockWasTaken
          ? "Order cancelled. Stock put back."
          : "Order request cancelled.",
    );

    return tx.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CANCELLED,
        refundRequired: paid,
        cancelledAt: now,
      },
    });
  });
  void notifyCustomerByEmail(orderId, "cancelled");
  return order;
}

export async function recordSale(input: {
  name: string;
  phone: string;
  address: string;
  zone: DeliveryZone;
  source: CustomerSource;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  mpesaCode?: string;
  notes?: string;
  items: { productId: string; quantity: number }[];
}) {
  if (input.items.length === 0) throw new DomainError("Add at least one product.");
  if (!input.name.trim() || !input.phone.trim() || !input.address.trim()) {
    throw new DomainError("Please enter the customer name, phone and location.");
  }

  return prisma.$transaction(async (tx) => {
    const customer = await findOrCreateCustomer(
      {
        name: input.name,
        phone: input.phone,
        location: input.address,
        source: input.source,
      },
      tx,
    );

    const products = await tx.product.findMany({
      where: { id: { in: input.items.map((item) => item.productId) } },
    });
    const productMap = new Map(products.map((product) => [product.id, product]));

    const lines = input.items.map((item) => {
      const product = productMap.get(item.productId);
      const quantity = Math.max(1, item.quantity);
      if (!product) throw new DomainError("A product on this sale is missing.");
      if (!product.isActive) throw new DomainError(`${product.name} is hidden from sale.`);
      return {
        product,
        quantity,
        unitPriceKes: product.priceKes,
        lineTotalKes: product.priceKes * quantity,
      };
    });

    const subtotalKes = lines.reduce((sum, line) => sum + line.lineTotalKes, 0);
    const orderNumber = `VEL-${Date.now().toString(36).toUpperCase()}`;

    const order = await tx.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        source: input.source,
        status: OrderStatus.CONFIRMED,
        fromWebsiteRequest: false,
        confirmedAt: new Date(),
        subtotalKes,
        deliveryFeeKes: 0,
        totalKes: subtotalKes,
        notes: input.notes || null,
        items: {
          create: lines.map((line) => ({
            productId: line.product.id,
            name: line.product.name,
            quantity: line.quantity,
            unitPriceKes: line.unitPriceKes,
            lineTotalKes: line.lineTotalKes,
          })),
        },
        payment: {
          create: {
            method: input.paymentMethod,
            status: input.paymentStatus,
            amountKes: subtotalKes,
            mpesaCode: input.mpesaCode || null,
          },
        },
        delivery: {
          create: {
            zone: input.zone,
            address: input.address,
            feeKes: 0,
            status: DeliveryStatus.PENDING,
          },
        },
      },
    });

    for (const line of lines) {
      await applyStockChange(
        tx,
        line.product.id,
        -line.quantity,
        InventoryMovementType.SALE,
        order.orderNumber,
      );
    }

    await logOrderEvent(tx, order.id, "Walk-in or phone sale recorded — stock taken off the shelf.");
    if (input.paymentStatus === PaymentStatus.PAID) {
      await tx.payment.update({
        where: { orderId: order.id },
        data: { paidAt: new Date() },
      });
      await logOrderEvent(tx, order.id, "Payment recorded at time of sale.");
    }

    return order;
  }).then((order) => {
    void notifyCustomerByEmail(order.id, "confirmed");
    return order;
  });
}

export async function updateEnquiry(
  orderId: string,
  input: {
    items: { productId: string; quantity: number }[];
    notes?: string;
    paymentMethod?: PaymentMethod;
    zone?: DeliveryZone;
    address?: string;
    deliveryFeeKes?: number;
  },
) {
  const items = input.items.filter((item) => item.quantity > 0);
  if (items.length === 0) {
    throw new DomainError("Keep at least one product, or cancel this order.");
  }

  return prisma.$transaction(async (tx) => {
    await lockOrderRow(tx, orderId);
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { payment: true, delivery: true },
    });
    if (!order) throw new DomainError("Order not found.");
    if (order.status !== OrderStatus.ENQUIRY) {
      throw new DomainError("This order is already confirmed. Stock has already been taken.");
    }

    const products = await tx.product.findMany({
      where: { id: { in: items.map((item) => item.productId) } },
    });
    const productMap = new Map(products.map((product) => [product.id, product]));

    await tx.orderItem.deleteMany({ where: { orderId } });
    await tx.orderItem.createMany({
      data: items.map((item) => {
        const product = productMap.get(item.productId);
        const quantity = Math.max(1, item.quantity);
        if (!product) throw new DomainError("A product on this order is missing.");
        return {
          orderId,
          productId: product.id,
          name: product.name,
          quantity,
          unitPriceKes: product.priceKes,
          lineTotalKes: product.priceKes * quantity,
        };
      }),
    });

    if (input.notes !== undefined) {
      await tx.order.update({
        where: { id: orderId },
        data: { notes: input.notes.trim() || null },
      });
    }
    if (input.paymentMethod && order.payment) {
      await tx.payment.update({
        where: { id: order.payment.id },
        data: { method: input.paymentMethod },
      });
    }
    if (order.delivery && (input.zone || input.address)) {
      await tx.delivery.update({
        where: { id: order.delivery.id },
        data: {
          zone: input.zone ?? order.delivery.zone,
          address: input.address?.trim() || order.delivery.address,
        },
      });
    }

    await syncOrderMoney(tx, orderId, input.deliveryFeeKes);
    await logOrderEvent(tx, orderId, "Order request updated before confirmation.");
    return tx.order.findUnique({ where: { id: orderId } });
  });
}

export async function markPaymentPaid(
  orderId: string,
  input?: { mpesaCode?: string; method?: PaymentMethod },
) {
  const before = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  });

  const payment = await prisma.$transaction(async (tx) => {
    await lockOrderRow(tx, orderId);
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });
    if (!order?.payment) throw new DomainError("Order not found.");
    if (order.status === OrderStatus.CANCELLED) {
      throw new DomainError("A cancelled order cannot be marked paid here.");
    }
    if (order.payment.status === PaymentStatus.PAID) {
      return order.payment;
    }

    const now = new Date();
    const method = input?.method ?? order.payment.method;
    const payment = await tx.payment.update({
      where: { id: order.payment.id },
      data: {
        status: PaymentStatus.PAID,
        method,
        mpesaCode: input?.mpesaCode || order.payment.mpesaCode,
        paidAt: now,
      },
    });

    const methodNote =
      method === PaymentMethod.MPESA && input?.mpesaCode
        ? `Payment recorded (${input.mpesaCode}).`
        : "Payment recorded.";
    await logOrderEvent(tx, orderId, methodNote);

    return payment;
  });

  if (before?.payment?.status !== PaymentStatus.PAID) {
    void notifyCustomerByEmail(orderId, "paid");
  }
  return payment;
}

export async function markOutForDelivery(orderId: string, riderName?: string) {
  const delivery = await prisma.$transaction(async (tx) => {
    await lockOrderRow(tx, orderId);
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { delivery: true },
    });
    if (!order?.delivery) throw new DomainError("Order not found.");
    if (order.status === OrderStatus.ENQUIRY) {
      throw new DomainError("Confirm the order before sending it out.");
    }
    if (order.status === OrderStatus.CANCELLED) {
      throw new DomainError("A cancelled order cannot go out for delivery.");
    }
    const now = new Date();
    const delivery = await tx.delivery.update({
      where: { id: order.delivery.id },
      data: {
        status: DeliveryStatus.OUT_FOR_DELIVERY,
        riderName: riderName || order.delivery.riderName,
        outForDeliveryAt: now,
        failedAt: null,
        failureReason: null,
      },
    });
    await logOrderEvent(
      tx,
      orderId,
      riderName?.trim()
        ? `Marked out for delivery (${riderName.trim()}).`
        : "Marked out for delivery.",
    );
    return delivery;
  });
  void notifyCustomerByEmail(orderId, "out_for_delivery");
  return delivery;
}

export async function markDelivered(orderId: string) {
  const delivery = await prisma.$transaction(async (tx) => {
    await lockOrderRow(tx, orderId);
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { delivery: true },
    });
    if (!order?.delivery) throw new DomainError("Order not found.");
    if (order.status === OrderStatus.ENQUIRY) {
      throw new DomainError("Confirm the order before marking it delivered.");
    }
    if (order.status === OrderStatus.CANCELLED) {
      throw new DomainError("A cancelled order cannot be marked delivered.");
    }
    const now = new Date();
    const delivery = await tx.delivery.update({
      where: { id: order.delivery.id },
      data: { status: DeliveryStatus.DELIVERED, deliveredAt: now },
    });
    await logOrderEvent(tx, orderId, "Marked delivered.");
    return delivery;
  });
  void notifyCustomerByEmail(orderId, "delivered");
  return delivery;
}

export async function markDeliveryFailed(orderId: string, reason?: string) {
  const delivery = await prisma.$transaction(async (tx) => {
    await lockOrderRow(tx, orderId);
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { delivery: true },
    });
    if (!order?.delivery) throw new DomainError("Order not found.");
    if (order.status === OrderStatus.ENQUIRY) {
      throw new DomainError("Confirm the order before recording a delivery problem.");
    }
    if (order.status === OrderStatus.CANCELLED) {
      throw new DomainError("A cancelled order cannot be updated.");
    }
    const now = new Date();
    const note = reason?.trim() ? `Delivery failed (${reason.trim()}).` : "Delivery failed.";
    const delivery = await tx.delivery.update({
      where: { id: order.delivery.id },
      data: {
        status: DeliveryStatus.FAILED,
        failedAt: now,
        failureReason: reason?.trim() || null,
      },
    });
    await logOrderEvent(tx, orderId, note);
    return delivery;
  });
  void notifyCustomerByEmail(orderId, "delivery_failed");
  return delivery;
}

export async function markOrderStatus(orderId: string, status: OrderStatus) {
  if (status === OrderStatus.CONFIRMED) return confirmOrder(orderId);
  if (status === OrderStatus.CANCELLED) return cancelOrder(orderId);

  const order = await prisma.$transaction(async (tx) => {
    await lockOrderRow(tx, orderId);
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) throw new DomainError("Order not found.");
    if (order.status === OrderStatus.ENQUIRY) {
      throw new DomainError("Confirm the order first.");
    }

    const now = new Date();
    const data: Prisma.OrderUpdateInput = { status };
    if (status === OrderStatus.PROCESSING) {
      data.processingAt = now;
      await logOrderEvent(tx, orderId, "Marked as processing.");
    }
    if (status === OrderStatus.COMPLETED) {
      data.completedAt = now;
      await logOrderEvent(tx, orderId, "Marked completed.");
    }

    return tx.order.update({ where: { id: orderId }, data });
  });

  if (status === OrderStatus.PROCESSING) void notifyCustomerByEmail(orderId, "processing");
  if (status === OrderStatus.COMPLETED) void notifyCustomerByEmail(orderId, "completed");
  return order;
}

export async function findOrCreateCustomer(
  input: {
    name: string;
    phone: string;
    email?: string;
    location?: string;
    source?: Prisma.CustomerCreateInput["source"];
  },
  tx: Prisma.TransactionClient | typeof prisma = prisma,
) {
  const phone = normalizeKenyanPhone(input.phone.trim());
  const email = input.email ? normalizeCustomerEmail(input.email) : undefined;
  const existing = await tx.customer.findFirst({ where: { phone } });
  if (existing) {
    return tx.customer.update({
      where: { id: existing.id },
      data: {
        name: input.name.trim() || existing.name,
        location: input.location ?? existing.location,
        email: email || existing.email,
      },
    });
  }
  return tx.customer.create({
    data: {
      name: input.name.trim(),
      phone,
      email: email || null,
      location: input.location,
      source: input.source ?? "WEBSITE",
    },
  });
}
