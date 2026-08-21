import { formatKes } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [orders, revenue, customers, lowStock] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { totalKes: true } }),
    prisma.customer.count(),
    prisma.product.findMany({
      where: { stockQuantity: { lte: 5 } },
      orderBy: { stockQuantity: "asc" },
      take: 8,
    }),
  ]);

  const topProducts = await prisma.orderItem.groupBy({
    by: ["name"],
    _sum: { quantity: true, lineTotalKes: true },
    orderBy: { _sum: { lineTotalKes: "desc" } },
    take: 5,
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Revenue" value={formatKes(revenue._sum.totalKes ?? 0)} />
        <Stat label="Orders" value={String(orders)} />
        <Stat label="Customers" value={String(customers)} />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-5">
          <h2 className="font-medium text-navy">Top products</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {topProducts.map((product) => (
              <li key={product.name} className="flex justify-between">
                <span>{product.name}</span>
                <span>{formatKes(product._sum.lineTotalKes ?? 0)}</span>
              </li>
            ))}
            {topProducts.length === 0 ? <li className="text-navy/60">No sales yet.</li> : null}
          </ul>
        </section>
        <section className="rounded-2xl bg-white p-5">
          <h2 className="font-medium text-navy">Low stock</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {lowStock.map((product) => (
              <li key={product.id} className="flex justify-between">
                <span>{product.name}</span>
                <span>{product.stockQuantity}</span>
              </li>
            ))}
            {lowStock.length === 0 ? <li className="text-navy/60">Stock looks healthy.</li> : null}
          </ul>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-5">
      <p className="text-sm text-navy/60">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-navy">{value}</p>
    </div>
  );
}
