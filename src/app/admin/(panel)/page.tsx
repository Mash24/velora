import { DashboardHero } from "@/components/admin/DashboardHero";
import {
  BarList,
  DashboardMiniStat,
  MostRequestedList,
  RequestChart,
} from "@/components/admin/DashboardCharts";
import { DashboardFilters } from "@/components/admin/DashboardFilters";
import {
  AdminBadge,
  AdminCard,
  AdminEmpty,
  AdminSectionTitle,
  AdminStatCard,
  AdminTable,
  AdminTableHead,
} from "@/components/admin/ui";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { DASHBOARD_METRICS, parseDashboardMetric } from "@/lib/admin-metrics";
import { loadDashboard } from "@/lib/admin-dashboard";
import { formatAdminDate, greetingForHour, nairobiNow, parseAdminPeriod } from "@/lib/admin-period";
import { deliveryStatusLabel, orderStatusLabel, paymentStatusLabel } from "@/lib/labels";
import Link from "next/link";
import { OrderStatus } from "@prisma/client";

function timeAgo(date: Date) {
  const minutes = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function isStale(date: Date) {
  return Date.now() - date.getTime() > 24 * 60 * 60 * 1000;
}

function orderBadgeTone(status: string): "teal" | "sand" | "coral" | "neutral" {
  if (status === "CANCELLED") return "coral";
  if (status === "ENQUIRY") return "sand";
  if (["CONFIRMED", "PROCESSING", "COMPLETED"].includes(status)) return "teal";
  return "neutral";
}

function paymentBadgeTone(status: string): "teal" | "sand" | "coral" | "neutral" {
  if (status === "PAID") return "teal";
  if (status === "UNPAID") return "sand";
  return "neutral";
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string; metric?: string }>;
}) {
  const query = await searchParams;
  const range = parseAdminPeriod(query);
  const metric = parseDashboardMetric(query.metric);
  const metricMeta = DASHBOARD_METRICS.find((item) => item.value === metric) ?? DASHBOARD_METRICS[0];
  const now = nairobiNow();
  const admin = await getCurrentAdmin();
  const data = await loadDashboard(range, metric);

  return (
    <div className="min-w-0">
      <DashboardHero
        greeting={greetingForHour(now.hour)}
        name={admin?.name ?? "there"}
        dateLabel={formatAdminDate(new Date())}
        newOrders={data.attention.newOrders}
      />

      <DashboardFilters
        metric={metric}
        period={range.period}
        from={query.from}
        to={query.to}
        periodLabel={range.label}
      />

      <section className="mb-8">
        <AdminSectionTitle description="Jump straight to what needs action today.">
          What needs your attention
        </AdminSectionTitle>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard
            label="New orders"
            value={data.attention.newOrders}
            hint={
              data.attention.oldestNewAt
                ? isStale(data.attention.oldestNewAt)
                  ? `Oldest waiting ${timeAgo(data.attention.oldestNewAt)} — review soon`
                  : `Oldest received ${timeAgo(data.attention.oldestNewAt)}`
                : "All caught up"
            }
            warn={data.attention.oldestNewAt ? isStale(data.attention.oldestNewAt) : false}
            href="/admin/orders?status=ENQUIRY"
          />
          <AdminStatCard
            label="Awaiting payment"
            value={data.attention.awaitingPayment}
            hint="Confirmed, not paid yet"
            href="/admin/orders?needs=payment"
            warn={data.attention.awaitingPayment > 0}
          />
          <AdminStatCard
            label="To deliver"
            value={data.attention.toDeliver}
            hint="Confirmed, not delivered"
            href="/admin/orders?needs=delivery"
            warn={data.attention.toDeliver > 0}
          />
          <AdminStatCard
            label="Low stock"
            value={data.attention.lowStock}
            hint="At or below the alert level"
            href="/admin/inventory?stock=low"
            warn={data.attention.lowStock > 0}
          />
        </div>
      </section>

      <div className="mb-6 grid gap-6 xl:grid-cols-5">
        <AdminCard
          title={metricMeta.label}
          description={metricMeta.hint}
          className="xl:col-span-3"
        >
          <div className="mb-4 flex items-baseline justify-between gap-3 border-b border-navy/6 pb-4">
            <p className="text-3xl font-semibold tabular-nums tracking-tight text-navy">
              {data.chart.total.toLocaleString("en-KE")}
            </p>
            <p className="text-sm text-navy/70">{range.label}</p>
          </div>
          {data.chart.total === 0 ? (
            <AdminEmpty>Nothing in this period yet.</AdminEmpty>
          ) : (
            <RequestChart buckets={data.chart.buckets} />
          )}
        </AdminCard>

        <AdminCard
          title="Most requested"
          description="Website requests only — units and order count."
          className="xl:col-span-2"
        >
          <MostRequestedList items={data.mostRequested} empty="Nothing requested in this period." />
        </AdminCard>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <AdminCard title="Demand by category" description={`Website requests · ${range.label}`}>
          <BarList items={data.demandByCategory} empty="No category demand in this period." />
        </AdminCard>

        <AdminCard
          title="Products needing attention"
          description="High demand with low or no stock."
          action={
            <Link href="/admin/inventory?stock=low" className="text-sm font-medium text-teal">
              Inventory →
            </Link>
          }
        >
          {data.productsNeedingAttention.length === 0 ? (
            <AdminEmpty>No high-demand products are low on stock.</AdminEmpty>
          ) : (
            <ul className="divide-y divide-navy/6">
              {data.productsNeedingAttention.map((product) => (
                <li
                  key={product.id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <Link href={`/admin/products/${product.id}`} className="font-medium text-teal">
                    {product.name}
                  </Link>
                  <div className="shrink-0 text-right text-sm tabular-nums">
                    <p className="font-medium text-navy">{product.requestedQty} asked</p>
                    <p className="text-xs text-navy/55">
                      {product.stockQuantity} left on shelf
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard
          title="Inventory snapshot"
          description="What is on the shelf right now."
          action={
            <Link href="/admin/inventory" className="text-sm font-medium text-teal">
              View all →
            </Link>
          }
        >
          <div className="grid grid-cols-3 gap-3">
            <DashboardMiniStat
              label="On the website"
              value={data.inventory.published}
              href="/admin/products"
              tone="teal"
            />
            <DashboardMiniStat
              label="Low stock"
              value={data.inventory.lowStock}
              href="/admin/inventory?stock=low"
              tone="sand"
            />
            <DashboardMiniStat
              label="Out of stock"
              value={data.inventory.outOfStock}
              href="/admin/inventory?stock=out"
              tone="coral"
            />
          </div>

          {data.inventory.alerts.length > 0 ? (
            <ul className="mt-5 divide-y divide-navy/6 border-t border-navy/6 pt-1">
              {data.inventory.alerts.map((product) => (
                <li
                  key={product.id}
                  className="flex items-center justify-between gap-3 py-2.5 first:pt-3"
                >
                  <Link href={`/admin/products/${product.id}`} className="text-sm font-medium text-teal">
                    {product.name}
                  </Link>
                  <AdminBadge tone={product.stockQuantity <= 0 ? "coral" : "sand"}>
                    {product.stockQuantity} {product.stockUnit}
                  </AdminBadge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-navy/55">Nothing below its alert level.</p>
          )}
        </AdminCard>

        <AdminCard
          title="Recent orders"
          description="Latest activity across all channels."
          action={
            <Link href="/admin/orders" className="text-sm font-medium text-teal">
              View all →
            </Link>
          }
          padding="p-0"
        >
          <AdminTable
            empty={data.recent.length === 0 ? <AdminEmpty>No orders yet.</AdminEmpty> : undefined}
          >
            <AdminTableHead>
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Status</th>
                <th className="hidden px-4 py-3 sm:table-cell">Payment</th>
              </tr>
            </AdminTableHead>
            <tbody>
              {data.recent.map((order) => (
                <tr key={order.id} className="border-t border-navy/6 transition hover:bg-sand/20">
                  <td className="px-4 py-3.5">
                    <Link href={`/admin/orders/${order.id}`} className="font-semibold text-teal">
                      {order.orderNumber}
                    </Link>
                    <p className="mt-0.5 text-xs text-navy/45">{timeAgo(order.createdAt)}</p>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-navy/80">{order.customer.name}</td>
                  <td className="px-4 py-3.5">
                    <AdminBadge tone={orderBadgeTone(order.status)}>
                      {orderStatusLabel(order.status as OrderStatus)}
                    </AdminBadge>
                    <p className="mt-1 text-xs text-navy/45 sm:hidden">
                      {paymentStatusLabel(order.payment?.status ?? "UNPAID")}
                    </p>
                  </td>
                  <td className="hidden px-4 py-3.5 sm:table-cell">
                    <AdminBadge tone={paymentBadgeTone(order.payment?.status ?? "UNPAID")}>
                      {paymentStatusLabel(order.payment?.status ?? "UNPAID")}
                    </AdminBadge>
                    <p className="mt-1 text-xs text-navy/45">
                      {deliveryStatusLabel(order.delivery?.status ?? "PENDING")}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </AdminTable>
        </AdminCard>
      </div>
    </div>
  );
}
