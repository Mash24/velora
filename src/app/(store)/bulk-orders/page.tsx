import { BUSINESS } from "@/lib/constants";
import Link from "next/link";

export const metadata = { title: "Bulk orders" };

export default function BulkOrdersPage() {
  return (
    <div className="site-container-narrow page-py min-w-0">
      <h1 className="text-3xl font-semibold">Bulk orders</h1>
      <p className="mt-4 text-navy/80">
        Clinics, hospitals and businesses can order larger quantities through the website. Add what
        you need and note that it is a bulk or institutional order.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/shop"
          className="inline-flex min-h-11 items-center rounded-full bg-navy px-5 py-3 text-sm font-medium text-cream"
        >
          Browse products
        </Link>
        <Link
          href="/your-order"
          className="inline-flex min-h-11 items-center rounded-full border border-navy/15 px-5 py-3 text-sm"
        >
          Your order
        </Link>
      </div>
      <p className="mt-8 text-sm text-navy/70">{BUSINESS.phoneDisplay}</p>
    </div>
  );
}
