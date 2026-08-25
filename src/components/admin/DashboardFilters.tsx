"use client";

import { MetricSelect } from "@/components/admin/MetricSelect";
import { PeriodSelect } from "@/components/admin/PeriodSelect";
import { AdminCard } from "@/components/admin/ui";
import { DASHBOARD_METRICS, type DashboardMetric } from "@/lib/admin-metrics";
import { Suspense } from "react";

export function DashboardFilters({
  metric,
  period,
  from,
  to,
  periodLabel,
}: {
  metric: DashboardMetric;
  period: string;
  from?: string;
  to?: string;
  periodLabel: string;
}) {
  const metricHint =
    DASHBOARD_METRICS.find((item) => item.value === metric)?.hint ??
    DASHBOARD_METRICS[0].hint;

  return (
    <AdminCard className="mb-8" padding="p-4 sm:p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="shrink-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-navy/60">
            How the shop is doing
          </p>
          <p className="mt-1 text-base font-semibold text-navy">{periodLabel}</p>
          <p className="mt-1 max-w-sm text-sm text-navy/60">
            Optional numbers — finish new orders first.
          </p>
        </div>

        <div className="w-full lg:max-w-lg">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-start">
            <Suspense fallback={null}>
              <MetricSelect metric={metric} showHint={false} />
            </Suspense>
            <Suspense fallback={null}>
              <PeriodSelect period={period} from={from} to={to} metric={metric} />
            </Suspense>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-navy/60">{metricHint}</p>
        </div>
      </div>
    </AdminCard>
  );
}
