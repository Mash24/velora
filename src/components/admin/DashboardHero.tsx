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
    <section className="relative mb-8 overflow-hidden rounded-2xl border border-navy/20 bg-[linear-gradient(135deg,#17384f_0%,#1a4560_55%,#16344c_100%)] px-4 py-6 shadow-[0_8px_32px_rgba(22,52,76,0.2)] sm:px-8 sm:py-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/5 blur-2xl"
      />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cream/85">
            Velora admin
          </p>
          <h1 className="mt-2 text-xl font-semibold tracking-tight text-cream sm:text-3xl break-anywhere">
            {greeting}, {name}
          </h1>
          <p className="mt-2 text-sm font-medium text-cream/90">{dateLabel}</p>

          {newOrders > 0 ? (
            <p className="mt-4 inline-flex items-center gap-2.5 rounded-full bg-cream px-4 py-2 text-sm font-medium text-navy shadow-sm">
              <span className="h-2 w-2 shrink-0 rounded-full bg-coral" aria-hidden />
              {newOrders} new order{newOrders === 1 ? "" : "s"} waiting for review
            </p>
          ) : null}
        </div>

        <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:flex-wrap">
          <Link
            href="/admin/orders?status=ENQUIRY"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border-2 border-cream px-4 text-sm font-semibold text-cream transition hover:bg-cream/10 sm:min-h-10 sm:w-auto"
          >
            Review orders
          </Link>
          <Link
            href="/admin/sales/new"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-cream px-4 text-sm font-semibold text-navy shadow-sm transition hover:bg-white sm:min-h-10 sm:w-auto"
          >
            Record sale
          </Link>
        </div>
      </div>
    </section>
  );
}
