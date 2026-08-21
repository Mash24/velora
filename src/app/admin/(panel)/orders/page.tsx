import { formatKes } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { customer: true, payment: true, delivery: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy">Orders</h1>
      <div className="mt-6 overflow-x-auto rounded-2xl bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-navy/10 text-navy/60">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Delivery</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-navy/5">
                <td className="px-4 py-3 font-medium text-navy">{order.orderNumber}</td>
                <td className="px-4 py-3">
                  {order.customer.name}
                  <div className="text-xs text-navy/50">{order.customer.phone}</div>
                </td>
                <td className="px-4 py-3">{order.source}</td>
                <td className="px-4 py-3">{formatKes(order.totalKes)}</td>
                <td className="px-4 py-3">{order.payment?.status ?? "UNPAID"}</td>
                <td className="px-4 py-3">
                  {order.delivery?.zone} · {order.delivery?.status}
                </td>
              </tr>
            ))}
            {orders.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-navy/60" colSpan={6}>
                  No orders yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
