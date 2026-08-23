import { Prisma } from "@prisma/client";

export const newOrderWhere: Prisma.OrderWhereInput = { status: "ENQUIRY" };

export const awaitingPaymentWhere: Prisma.OrderWhereInput = {
  status: { in: ["CONFIRMED", "PROCESSING"] },
  payment: { status: "UNPAID" },
};

export const toDeliverWhere: Prisma.OrderWhereInput = {
  status: { in: ["CONFIRMED", "PROCESSING"] },
  NOT: { delivery: { status: "DELIVERED" } },
};

export function isLowStock(product: { stockQuantity: number; reorderThreshold: number }) {
  return product.stockQuantity <= product.reorderThreshold;
}
