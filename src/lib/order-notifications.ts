import { sendOrderStatusEmail, type OrderEmailEvent } from "./order-emails";
import { prisma } from "./prisma";

async function loadOrderEmailData(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      items: true,
      payment: true,
      delivery: true,
    },
  });
}

export async function notifyCustomerByEmail(orderId: string, event: OrderEmailEvent) {
  try {
    const order = await loadOrderEmailData(orderId);
    if (!order?.customer.email) return;

    await sendOrderStatusEmail(
      {
        orderNumber: order.orderNumber,
        status: order.status,
        subtotalKes: order.subtotalKes,
        deliveryFeeKes: order.deliveryFeeKes,
        totalKes: order.totalKes,
        customer: { name: order.customer.name, email: order.customer.email },
        items: order.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          lineTotalKes: item.lineTotalKes,
        })),
        payment: order.payment,
        delivery: order.delivery,
      },
      event,
    );
  } catch (error) {
    console.error(`Order email failed (${event}, ${orderId}):`, error);
  }
}
