import Link from "next/link";

export function DashboardHero({
  greeting,
  name,
  dateLabel,
  newOrders,
}: {
  greeting: string;
  name: string;
  dateLabel: string;
  newOrders: number;
}) {
  return (
    <section className="relative mb-6 overflow-hidden rounded-2xl bg-navy px-4 py-6 text-cream shadow-[0_16px_40px_rgba(22,52,76,0.22)] sm:mb-8 sm:px-8 sm:py-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 right-0 h-56 w-56 rounded-full bg-teal/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-coral/15 blur-3xl"
      />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal">Velora admin</p>
          <h1 className="mt-2 break-anywhere text-[clamp(1.25rem,4.5vw,1.875rem)] font-semibold tracking-tight text-cream">
            {greeting}, {name}
          </h1>
          <p className="mt-2 text-sm font-medium text-cream/75">{dateLabel}</p>

          {newOrders > 0 ? (
            <p className="mt-4 inline-flex items-center gap-2.5 rounded-full bg-cream px-3.5 py-1.5 text-sm font-medium text-navy">
              <span className="h-2 w-2 shrink-0 rounded-full bg-coral" aria-hidden />
              {newOrders} new order{newOrders === 1 ? "" : "s"} waiting
            </p>
          ) : null}
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Link
            href="/admin/orders?status=ENQUIRY"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-teal px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal/90 sm:w-auto"
          >
            {newOrders > 0 ? `Open ${newOrders} new order${newOrders === 1 ? "" : "s"}` : "Open orders"}
          </Link>
          <Link
            href="/admin/sales/new"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-cream/30 px-4 text-sm font-semibold text-cream transition hover:bg-cream/10 sm:w-auto"
          >
            Record a sale
          </Link>
        </div>
      </div>
    </section>
  );
}
