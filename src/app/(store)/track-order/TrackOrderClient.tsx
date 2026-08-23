"use client";

import { OrderStatusView, type PublicOrderView } from "@/components/store/OrderStatusView";
import { isUsablePhone } from "@/lib/phone";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export default function TrackOrderClient() {
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<PublicOrderView | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function lookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const orderNumber = String(form.get("orderNumber") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();

    if (!orderNumber || !isUsablePhone(phone)) {
      setError("Enter your order number and the phone number you used when ordering.");
      return;
    }

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const response = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, phone }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "We could not find that order.");
        setLoading(false);
        return;
      }
      setOrder(data.order as PublicOrderView);
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="site-container-narrow page-py min-w-0">
      <h1 className="text-3xl font-semibold">Track your order</h1>
      <p className="mt-2 text-navy/70">
        Enter your order number and phone number to see the latest status.
      </p>

      <form onSubmit={lookup} className="mt-8 space-y-4 rounded-2xl border border-navy/10 bg-white p-5">
        <label className="block text-sm font-medium text-navy">
          Order number
          <input
            name="orderNumber"
            required
            defaultValue={searchParams.get("order") ?? ""}
            placeholder="e.g. VEL-MT5X526W"
            className="mt-1.5 min-h-11 w-full rounded-xl border border-navy/15 px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium text-navy">
          Phone number
          <input
            name="phone"
            required
            autoComplete="tel"
            inputMode="tel"
            placeholder="07XX XXX XXX"
            className="mt-1.5 min-h-11 w-full rounded-xl border border-navy/15 px-3 py-2"
          />
        </label>
        {error ? <p className="text-sm text-coral">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="min-h-11 w-full rounded-full bg-navy px-4 text-sm font-medium text-cream disabled:opacity-60"
        >
          {loading ? "Looking up..." : "Track order"}
        </button>
      </form>

      {order ? (
        <div className="mt-8">
          <OrderStatusView order={order} />
        </div>
      ) : null}

      <p className="mt-8 text-sm text-navy/70">
        Just placed an order?{" "}
        <Link href="/shop" className="text-teal">
          Continue shopping
        </Link>
      </p>
    </div>
  );
}
