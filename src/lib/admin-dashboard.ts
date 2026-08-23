import { type DashboardMetric } from "./admin-metrics";
import { awaitingPaymentWhere, isLowStock, newOrderWhere, toDeliverWhere } from "./admin-filters";
import { chartBuckets, type PeriodRange } from "./admin-period";
import { prisma } from "./prisma";

function bucketValue(
  metric: DashboardMetric,
  bucket: { start: Date; end: Date },
  data: {
    websiteOrders: { createdAt: Date }[];
    confirmedOrders: { confirmedAt: Date | null }[];
    completedOrders: { completedAt: Date | null }[];
    websiteItems: { createdAt: Date; quantity: number }[];
    soldItems: { confirmedAt: Date | null; quantity: number }[];
  },
) {
  const inBucket = (date: Date | null | undefined) =>
    date != null && date >= bucket.start && date < bucket.end;

  switch (metric) {
    case "requests":
      return data.websiteOrders.filter((order) => inBucket(order.createdAt)).length;
    case "confirmed":
      return data.confirmedOrders.filter((order) => inBucket(order.confirmedAt)).length;
    case "completed":
      return data.completedOrders.filter((order) => inBucket(order.completedAt)).length;
    case "units-requested":
      return data.websiteItems
        .filter((item) => inBucket(item.createdAt))
        .reduce((sum, item) => sum + item.quantity, 0);
    case "units-sold":
      return data.soldItems
        .filter((item) => inBucket(item.confirmedAt))
        .reduce((sum, item) => sum + item.quantity, 0);
  }
}

export async function loadDashboard(range: PeriodRange, metric: DashboardMetric) {
  const inPeriod = { createdAt: { gte: range.start, lt: range.end } };
  const confirmedInPeriod = { confirmedAt: { gte: range.start, lt: range.end } };
  const completedInPeriod = { completedAt: { gte: range.start, lt: range.end } };

  const [
    newOrders,
    awaitingPayment,
    toDeliver,
    oldestNew,
    products,
    websiteOrdersInPeriod,
    confirmedOrdersInPeriod,
    completedOrdersInPeriod,
    websiteItemsInPeriod,
    soldItemsInPeriod,
    recent,
  ] = await Promise.all([
    prisma.order.count({ where: newOrderWhere }),
    prisma.order.count({ where: awaitingPaymentWhere }),
    prisma.order.count({ where: toDeliverWhere }),
    prisma.order.findFirst({
      where: newOrderWhere,
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    }),
    prisma.product.findMany({
      select: {
        id: true,
        name: true,
        stockQuantity: true,
        reorderThreshold: true,
        isActive: true,
        stockUnit: true,
      },
      orderBy: { stockQuantity: "asc" },
    }),
    prisma.order.findMany({
      where: { ...inPeriod, fromWebsiteRequest: true },
      select: { createdAt: true },
    }),
    prisma.order.findMany({
      where: confirmedInPeriod,
      select: { confirmedAt: true },
    }),
    prisma.order.findMany({
      where: completedInPeriod,
      select: { completedAt: true },
    }),
    prisma.orderItem.findMany({
      where: { order: { ...inPeriod, fromWebsiteRequest: true } },
      select: {
        name: true,
        quantity: true,
        orderId: true,
        productId: true,
        order: { select: { createdAt: true } },
        product: { select: { category: { select: { name: true } } } },
      },
    }),
    prisma.orderItem.findMany({
      where: { order: confirmedInPeriod },
      select: {
        quantity: true,
        productId: true,
        order: { select: { confirmedAt: true } },
      },
    }),
    prisma.order.findMany({
      include: { customer: true, payment: true, delivery: true, items: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const chartData = {
    websiteOrders: websiteOrdersInPeriod,
    confirmedOrders: confirmedOrdersInPeriod,
    completedOrders: completedOrdersInPeriod,
    websiteItems: websiteItemsInPeriod.map((item) => ({
      createdAt: item.order.createdAt,
      quantity: item.quantity,
    })),
    soldItems: soldItemsInPeriod.map((item) => ({
      confirmedAt: item.order.confirmedAt,
      quantity: item.quantity,
    })),
  };

  const buckets = chartBuckets(range).map((bucket) => ({
    label: bucket.label,
    value: bucketValue(metric, bucket, chartData),
  }));

  const requestedMap = new Map<string, { quantity: number; orders: Set<string> }>();
  const categoryMap = new Map<string, number>();
  for (const item of websiteItemsInPeriod) {
    const current = requestedMap.get(item.name) ?? { quantity: 0, orders: new Set<string>() };
    current.quantity += item.quantity;
    current.orders.add(item.orderId);
    requestedMap.set(item.name, current);
    const category = item.product.category.name;
    categoryMap.set(category, (categoryMap.get(category) ?? 0) + item.quantity);
  }

  const mostRequested = [...requestedMap.entries()]
    .sort((a, b) => b[1].quantity - a[1].quantity)
    .slice(0, 6)
    .map(([name, stats]) => ({
      name,
      quantity: stats.quantity,
      orderCount: stats.orders.size,
    }));

  const demandByCategory = [...categoryMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, quantity]) => ({ name, quantity }));

  const demandByProduct = new Map<string, number>();
  for (const item of websiteItemsInPeriod) {
    demandByProduct.set(item.productId, (demandByProduct.get(item.productId) ?? 0) + item.quantity);
  }

  const productsNeedingAttention = products
    .map((product) => ({
      ...product,
      requestedQty: demandByProduct.get(product.id) ?? 0,
    }))
    .filter((product) => product.requestedQty > 0 && isLowStock(product))
    .sort((a, b) => b.requestedQty - a.requestedQty)
    .slice(0, 6);

  const lowStock = products.filter(isLowStock);
  const outOfStock = products.filter((product) => product.stockQuantity <= 0);

  const totalForMetric = buckets.reduce((sum, bucket) => sum + bucket.value, 0);

  return {
    attention: {
      newOrders,
      awaitingPayment,
      toDeliver,
      lowStock: lowStock.length,
      oldestNewAt: oldestNew?.createdAt ?? null,
    },
    chart: {
      metric,
      total: totalForMetric,
      buckets,
    },
    mostRequested,
    demandByCategory,
    productsNeedingAttention,
    inventory: {
      products: products.length,
      published: products.filter((product) => product.isActive).length,
      lowStock: lowStock.length,
      outOfStock: outOfStock.length,
      alerts: lowStock.slice(0, 6),
    },
    recent,
  };
}
