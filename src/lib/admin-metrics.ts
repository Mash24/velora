export type DashboardMetric =
  | "requests"
  | "confirmed"
  | "completed"
  | "units-requested"
  | "units-sold";

export const DASHBOARD_METRICS: { value: DashboardMetric; label: string; hint: string }[] = [
  {
    value: "requests",
    label: "Order requests",
    hint: "Website requests received — not walk-in sales.",
  },
  {
    value: "confirmed",
    label: "Confirmed orders",
    hint: "Sales confirmed in this period.",
  },
  {
    value: "completed",
    label: "Completed orders",
    hint: "Orders marked completed in this period.",
  },
  {
    value: "units-requested",
    label: "Units requested",
    hint: "Total quantity on website requests received.",
  },
  {
    value: "units-sold",
    label: "Units sold",
    hint: "Total quantity on orders confirmed in this period.",
  },
];

export function parseDashboardMetric(value?: string): DashboardMetric {
  if (value && DASHBOARD_METRICS.some((metric) => metric.value === value)) {
    return value as DashboardMetric;
  }
  return "requests";
}
