"use client";

import { OrderLineCard } from "@/components/store/OrderLineCard";
import { BUSINESS } from "@/lib/constants";
import { formatKes } from "@/lib/format";
import { KENYA_COUNTIES } from "@/lib/kenya-counties";
import { clearOrder, readOrder, SOURCE_STORAGE_KEY, type OrderLine } from "@/lib/order-storage";
import { isUsablePhone } from "@/lib/phone";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState, type ReactNode } from "react";

type FulfillmentType = "PICKUP" | "DELIVERY";

const fieldClass =
  "mt-1.5 min-h-11 w-full rounded-xl border border-navy/15 bg-white px-3 py-2 text-navy placeholder:text-navy/40";

function StepHeading({ step, children }: { step: number; children: ReactNode }) {
  return (
    <h2 className="flex items-center gap-2.5 text-base font-semibold tracking-tight text-navy">
      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal text-xs font-bold text-white">
        {step}
      </span>
      {children}
    </h2>
  );
}

export default function YourOrderPage() {
  const router = useRouter();
  // Start empty so server HTML matches the first client render (localStorage is client-only).
  const [items, setItems] = useState<OrderLine[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [fulfillment, setFulfillment] = useState<FulfillmentType>("DELIVERY");

  useEffect(() => {
    setItems(readOrder());
    setReady(true);
  }, []);

  function refresh() {
    setItems(readOrder());
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const current = readOrder();
    if (current.length === 0) {
      setError("Add a product from the shop first.");
      return;
    }
    const form = event.currentTarget;
    const data = new FormData(form);
    const phone = String(data.get("phone") ?? "");
    if (!form.reportValidity()) return;
    if (!isUsablePhone(phone)) {
      setError("Please enter a valid Kenyan phone number, e.g. 07XX XXX XXX.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          phone: data.get("phone"),
          email: data.get("email"),
          fulfillmentType: fulfillment,
          county: data.get("county"),
          city: data.get("city"),
          address: data.get("address"),
          roomNumber: data.get("roomNumber"),
          source: localStorage.getItem(SOURCE_STORAGE_KEY),
          notes: data.get("notes"),
          items: current.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setSaving(false);
        setError(result.error ?? "Please check your details and try again.");
        return;
      }
      clearOrder();
      router.push(`/order/${result.orderNumber}`);
    } catch {
      setSaving(false);
      setError("The network dropped. Please try again.");
    }
  }

  const productTotal = items.reduce((sum, item) => sum + item.priceKes * item.quantity, 0);
  const productCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="site-container-narrow page-py min-w-0">
      <Link href="/shop" className="inline-flex items-center gap-1 text-sm font-semibold text-teal">
        ← Continue shopping
      </Link>

      <h1 className="page-heading mt-4">Your order</h1>
      <p className="mt-2 text-navy/70">
        Check your products, fill in your details, then place the order at the bottom.
      </p>

      {!ready ? (
        <div className="mt-10 space-y-3" aria-busy="true" aria-label="Loading your order">
          <div className="h-24 animate-pulse rounded-2xl bg-navy/5" />
          <div className="h-24 animate-pulse rounded-2xl bg-navy/5" />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-navy/10 bg-white p-6 text-center">
          <p className="text-navy/80">Your order is empty.</p>
          <Link
            href="/shop"
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-teal px-5 text-sm font-semibold text-white"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-10">
          <section className="space-y-4">
            <StepHeading step={1}>
              Your products{productCount > 1 ? ` (${productCount})` : ""}
            </StepHeading>
            <ul className="space-y-3">
              {items.map((item) => (
                <OrderLineCard key={item.productId} item={item} onChange={refresh} />
              ))}
            </ul>
            <Link
              href="/shop"
              className="inline-flex min-h-10 items-center rounded-xl border border-navy/12 bg-white px-4 text-sm font-semibold text-navy"
            >
              + Add more products
            </Link>
          </section>

          <section className="space-y-4 rounded-2xl border border-navy/10 bg-white p-5">
            <p className="text-sm font-semibold text-navy">Order summary</p>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-navy/70">Products</dt>
                <dd className="font-semibold tabular-nums">{formatKes(productTotal)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-navy/70">{fulfillment === "PICKUP" ? "Pickup" : "Delivery"}</dt>
                <dd className="text-navy/60">
                  {fulfillment === "PICKUP" ? "At our shop" : "Quoted for your location"}
                </dd>
              </div>
            </dl>
            <p className="border-t border-navy/10 pt-3 text-xs text-navy/60">
              {fulfillment === "DELIVERY"
                ? "Delivery cost is added based on where you are."
                : "Collect from our Nairobi CBD shop."}
            </p>
          </section>

          <section className="space-y-4">
            <StepHeading step={2}>Your details</StepHeading>
            <label className="block text-sm font-medium text-navy">
              Full name <span className="text-coral">*</span>
              <input
                name="name"
                required
                autoComplete="name"
                placeholder="Jane Mwangi"
                className={fieldClass}
              />
            </label>
            <label className="block text-sm font-medium text-navy">
              Phone number <span className="text-coral">*</span>
              <input
                name="phone"
                required
                autoComplete="tel"
                inputMode="tel"
                placeholder="07XX XXX XXX"
                className={fieldClass}
              />
              <span className="mt-1.5 block text-xs font-normal text-navy/60">
                We&apos;ll call or WhatsApp this number about your order.
              </span>
            </label>
            <label className="block text-sm font-medium text-navy">
              Email <span className="font-normal text-navy/50">(optional)</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={fieldClass}
              />
            </label>
          </section>

          <section className="space-y-4">
            <StepHeading step={3}>Pickup or delivery?</StepHeading>
            <fieldset className="space-y-3">
              <legend className="sr-only">Pickup or delivery</legend>
              <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border border-navy/10 bg-white p-4 has-[:checked]:border-teal has-[:checked]:ring-1 has-[:checked]:ring-teal">
                <input
                  type="radio"
                  name="fulfillmentType"
                  checked={fulfillment === "PICKUP"}
                  onChange={() => setFulfillment("PICKUP")}
                  className="mt-1"
                />
                <span>
                  <span className="block text-sm font-semibold text-navy">Collect from our shop</span>
                  <span className="mt-1 block text-sm text-navy/70">{BUSINESS.location}</span>
                  <span className="mt-0.5 block text-xs text-navy/60">{BUSINESS.landmark}</span>
                </span>
              </label>
              <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-navy/10 bg-white p-4 has-[:checked]:border-teal has-[:checked]:ring-1 has-[:checked]:ring-teal">
                <input
                  type="radio"
                  name="fulfillmentType"
                  checked={fulfillment === "DELIVERY"}
                  onChange={() => setFulfillment("DELIVERY")}
                />
                <span className="text-sm font-semibold text-navy">Deliver to me</span>
              </label>
            </fieldset>

            {fulfillment === "DELIVERY" ? (
              <div className="space-y-4 rounded-2xl border border-navy/10 bg-white p-4">
                <p className="text-sm font-semibold text-navy">Where should we deliver?</p>
                <label className="block text-sm font-medium text-navy">
                  County <span className="text-coral">*</span>
                  <select name="county" required defaultValue="" className={fieldClass}>
                    <option value="" disabled>
                      Select county
                    </option>
                    {KENYA_COUNTIES.map((county) => (
                      <option key={county} value={county}>
                        {county}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-medium text-navy">
                  Town / city <span className="text-coral">*</span>
                  <input
                    name="city"
                    required
                    placeholder="e.g. Westlands, Nakuru, Kisumu"
                    className={fieldClass}
                  />
                </label>
                <label className="block text-sm font-medium text-navy">
                  Street, estate, building or landmark <span className="text-coral">*</span>
                  <textarea
                    name="address"
                    required
                    rows={3}
                    placeholder="e.g. ABC Apartments, Waiyaki Way, near Sarit Centre"
                    className={fieldClass}
                  />
                </label>
                <label className="block text-sm font-medium text-navy">
                  Room / floor / unit no. <span className="font-normal text-navy/50">(optional)</span>
                  <input
                    name="roomNumber"
                    placeholder="e.g. Room 12, 3rd floor"
                    className={fieldClass}
                  />
                </label>
              </div>
            ) : null}
          </section>

          <section className="space-y-4">
            <label className="block text-sm font-medium text-navy">
              Notes <span className="font-normal text-navy/50">(optional)</span>
              <textarea
                name="notes"
                rows={3}
                placeholder="Anything you'd like us to know about your order"
                className={fieldClass}
              />
            </label>
          </section>

          {error ? <p className="text-sm font-medium text-coral">{error}</p> : null}

          <section className="rounded-2xl border border-navy/10 bg-white p-5 shadow-[0_8px_24px_rgba(22,52,76,0.06)]">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-navy/50">
                  Ready to place
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-navy">
                  {formatKes(productTotal)}
                </p>
                <p className="mt-1 text-xs text-navy/60">
                  {fulfillment === "DELIVERY" ? "Plus delivery (quoted after)" : "Pickup at the shop"}
                </p>
              </div>
              <p className="max-w-[9rem] text-right text-xs text-navy/55">
                {productCount} item{productCount === 1 ? "" : "s"}
              </p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="mt-5 min-h-12 w-full rounded-xl bg-teal px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-teal/90 disabled:opacity-60"
            >
              {saving ? "Placing order…" : "Place order"}
            </button>
            <p className="mt-3 text-center text-xs text-navy/60">
              Pay with M-Pesa, cash, or pay on delivery after we confirm.
            </p>
          </section>
        </form>
      )}
    </div>
  );
}
