import Link from "next/link";

export function BarList({
  items,
  empty,
}: {
  items: { name: string; quantity: number }[];
  empty: string;
}) {
  const max = Math.max(...items.map((item) => item.quantity), 0);
  if (items.length === 0) {
    return <p className="text-sm text-navy/70">{empty}</p>;
  }
  return (
    <ul className="space-y-4">
      {items.map((item, index) => (
        <li key={item.name}>
          <div className="flex items-center gap-3 text-sm">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-navy/10 bg-white text-xs font-semibold tabular-nums text-navy">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex justify-between gap-3">
                <span className="truncate font-medium text-navy">{item.name}</span>
                <span className="shrink-0 tabular-nums text-navy">{item.quantity}</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-mist">
                <div
                  className="h-full rounded-full bg-teal"
                  style={{ width: `${max ? Math.max(6, (item.quantity / max) * 100) : 0}%` }}
                />
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function MostRequestedList({
  items,
  empty,
}: {
  items: { name: string; quantity: number; orderCount: number }[];
  empty: string;
}) {
  const max = Math.max(...items.map((item) => item.quantity), 0);
  if (items.length === 0) {
    return <p className="text-sm text-navy/70">{empty}</p>;
  }
  return (
    <ul className="divide-y divide-navy/8">
      {items.map((item, index) => (
        <li key={item.name} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-navy/10 bg-white text-xs font-semibold tabular-nums text-navy">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <p className="truncate text-sm font-medium text-navy">{item.name}</p>
              <div className="shrink-0 text-right text-sm tabular-nums">
                <p className="font-semibold text-navy">{item.quantity}</p>
                <p className="text-xs text-navy/60">
                  {item.orderCount} order{item.orderCount === 1 ? "" : "s"}
                </p>
              </div>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-mist">
              <div
                className="h-full rounded-full bg-navy/70"
                style={{ width: `${max ? Math.max(6, (item.quantity / max) * 100) : 0}%` }}
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function RequestChart({ buckets }: { buckets: { label: string; value: number }[] }) {
  const max = Math.max(...buckets.map((bucket) => bucket.value), 0);
  const dense = buckets.length > 14;

  return (
    <div className="relative pt-2">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-2 flex h-40 flex-col justify-between"
      >
        {[0, 1, 2, 3].map((line) => (
          <div key={line} className="border-t border-navy/10" />
        ))}
      </div>

      <div className="relative flex h-32 items-end gap-0.5 sm:h-44 sm:gap-1.5">
        {buckets.map((bucket) => {
          const height = max ? Math.max(6, (bucket.value / max) * 128) : 6;
          const hasValue = bucket.value > 0;
          return (
            <div
              key={bucket.label}
              className="flex min-w-0 flex-1 flex-col items-center justify-end"
            >
              <span className="mb-1.5 text-[10px] font-medium tabular-nums text-navy/70">
                {hasValue ? bucket.value : ""}
              </span>
              <div
                className={`w-full max-w-9 rounded-t-md ${hasValue ? "bg-navy" : "bg-navy/12"}`}
                style={{ height: `${height}px` }}
                title={`${bucket.label}: ${bucket.value}`}
              />
              <span
                className={`mt-2 w-full truncate text-center text-[10px] font-medium text-navy/60 ${
                  dense ? "hidden sm:block" : ""
                }`}
              >
                {bucket.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DashboardMiniStat({
  label,
  value,
  href,
  tone = "neutral",
}: {
  label: string;
  value: number;
  href: string;
  tone?: "neutral" | "teal" | "sand" | "coral";
}) {
  const accents = {
    neutral: "border-navy/10",
    teal: "border-teal/40",
    sand: "border-navy/15",
    coral: "border-coral/40",
  };

  return (
    <Link
      href={href}
      className={`block rounded-xl border bg-white px-3 py-4 text-center transition hover:bg-sand/30 ${accents[tone]}`}
    >
      <p className="text-2xl font-semibold tabular-nums tracking-tight text-navy">{value}</p>
      <p className="mt-1 text-xs font-medium text-navy/70">{label}</p>
    </Link>
  );
}
