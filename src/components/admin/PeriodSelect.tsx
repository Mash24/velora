"use client";

import { adminButtonClass, adminInputClass, adminLabelClass, adminSelectClass } from "@/components/admin/ui";
import { useRouter, useSearchParams } from "next/navigation";

export function PeriodSelect({
  period,
  from,
  to,
  metric,
}: {
  period: string;
  from?: string;
  to?: string;
  metric?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function go(next: string, extra = "") {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", next);
    if (metric) params.set("metric", metric);
    if (next === "custom") {
      router.push(`/admin?${params.toString()}${extra}`);
      return;
    }
    params.delete("from");
    params.delete("to");
    router.push(`/admin?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="admin-period" className={adminLabelClass}>
        Period
      </label>
      <select
        id="admin-period"
        name="period"
        defaultValue={period}
        onChange={(event) => go(event.target.value)}
        className={adminSelectClass}
      >
        <option value="today">Today</option>
        <option value="week">This week</option>
        <option value="month">This month</option>
        <option value="year">This year</option>
        <option value="custom">Custom range</option>
      </select>

      {period === "custom" ? (
        <form className="mt-1 grid gap-3 sm:grid-cols-[1fr_1fr_auto]" action="/admin">
          {metric ? <input type="hidden" name="metric" value={metric} /> : null}
          <input type="hidden" name="period" value="custom" />
          <label className={adminLabelClass}>
            From
            <input type="date" name="from" defaultValue={from} className={`${adminInputClass} mt-1.5`} />
          </label>
          <label className={adminLabelClass}>
            To
            <input type="date" name="to" defaultValue={to} className={`${adminInputClass} mt-1.5`} />
          </label>
          <div className="flex items-end">
            <button type="submit" className={adminButtonClass("primary")}>
              Apply
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
