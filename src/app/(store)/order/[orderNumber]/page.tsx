import { formatKes } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true, delivery: true, payment: true },
  });

  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-xs uppercase tracking-[0.2em] text-teal">Order received</p>
      <h1 className="mt-3 text-3xl font-semibold">{order.orderNumber}</h1>
      <p className="mt-3 text-navy/75">
        We have recorded this order. Continue on WhatsApp if the chat did not open, then complete
        M-Pesa payment. Nairobi orders can pay after delivery; orders outside Nairobi are paid first.
      </p>
      <ul className="mt-6 space-y-2 rounded-2xl bg-white p-5">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between text-sm">
            <span>
              {item.name} × {item.quantity}
            </span>
            <span>{formatKes(item.lineTotalKes)}</span>
          </li>
        ))}
        <li className="flex justify-between border-t border-navy/10 pt-2 font-medium">
          <span>Total</span>
          <span>{formatKes(order.totalKes)}</span>
        </li>
      </ul>
    </div>
  );
}
