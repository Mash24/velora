import { Prisma } from "@prisma/client";

export async function logOrderEvent(
  tx: Prisma.TransactionClient,
  orderId: string,
  message: string,
) {
  await tx.orderEvent.create({ data: { orderId, message } });
}
