"use client";

import { adminLabelClass, adminSelectClass } from "@/components/admin/ui";
import { DASHBOARD_METRICS, type DashboardMetric } from "@/lib/admin-metrics";
import { useRouter, useSearchParams } from "next/navigation";

export function MetricSelect({
  metric,
  showHint = true,
}: {
  metric: DashboardMetric;
  showHint?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = DASHBOARD_METRICS.find((item) => item.value === metric) ?? DASHBOARD_METRICS[0];

  function onChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("metric", value);
    router.push(`/admin?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="admin-metric" className={adminLabelClass}>
        Chart to show
      </label>
      <select
        id="admin-metric"
        value={metric}
        onChange={(event) => onChange(event.target.value)}
        className={adminSelectClass}
      >
        {DASHBOARD_METRICS.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      {showHint ? <p className="text-xs leading-relaxed text-navy/60">{active.hint}</p> : null}
    </div>
  );
}
