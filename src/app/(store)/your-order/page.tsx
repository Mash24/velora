"use client";

import { OrderLineCard } from "@/components/store/OrderLineCard";
import { BUSINESS } from "@/lib/constants";
import { formatKes } from "@/lib/format";
import { KENYA_COUNTIES } from "@/lib/kenya-counties";
import { clearOrder, readOrder, SOURCE_STORAGE_KEY, type OrderLine } from "@/lib/order-storage";
import { isUsablePhone } from "@/lib/phone";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, type ReactNode } from "react";

type FulfillmentType = "PICKUP" | "DELIVERY";

const fieldClass =
  "mt-1.5 min-h-11 w-full rounded-xl border border-navy/15 bg-white px-3 py-2 text-navy placeholder:text-navy/40";

const sectionClass = "mt-10 space-y-4";

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-teal">{children}</h2>
  );
}

export default function YourOrderPage() {
  const router = useRouter();
  const [items, setItems] = useState<OrderLine[]>(() => readOrder());
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [fulfillment, setFulfillment] = useState<FulfillmentType>("DELIVERY");

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
    <div className="site-container-narrow page-py min-w-0 pb-32">
      <Link href="/shop" className="inline-flex items-center gap-1 text-sm font-medium text-teal">
        ← Continue shopping
      </Link>

      <h1 className="page-heading mt-4">Your order</h1>
      <p className="mt-2 text-navy/70">
        Review the products you&apos;d like to order. We&apos;ll confirm availability and the final
        total before you pay.
      </p>

      {items.length === 0 ? (
        <p className="mt-8 text-navy/70">
          Your order is empty.{" "}
          <Link href="/shop" className="text-teal">
            Browse products
          </Link>
          .
        </p>
      ) : (
        <>
          <section className={sectionClass}>
            <SectionHeading>
              Your products{productCount > 1 ? ` (${productCount})` : ""}
            </SectionHeading>
            <ul className="space-y-3">
              {items.map((item) => (
                <OrderLineCard key={item.productId} item={item} onChange={refresh} />
              ))}
            </ul>
            <Link href="/shop" className="inline-block text-sm font-medium text-teal">
              + Add more products
            </Link>
          </section>

          <section className={`${sectionClass} rounded-2xl border border-navy/10 bg-white p-5`}>
            <SectionHeading>Order summary</SectionHeading>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-navy/70">Products</dt>
                <dd className="font-medium">{formatKes(productTotal)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-navy/70">{fulfillment === "PICKUP" ? "Pickup" : "Delivery"}</dt>
                <dd className="text-navy/60">
                  {fulfillment === "PICKUP" ? "At our shop" : "To be confirmed"}
                </dd>
              </div>
            </dl>
            <p className="mt-3 border-t border-navy/10 pt-3 text-xs text-navy/60">
              {fulfillment === "DELIVERY"
                ? "Delivery cost is not included yet — we’ll confirm it before you pay."
                : "We’ll confirm availability before you pay."}
            </p>
          </section>

          <form onSubmit={submit} className="mt-10 space-y-10">
            <section className="space-y-4">
              <SectionHeading>Your details</SectionHeading>
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
                  We&apos;ll contact you on this number to confirm your order.
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
                <span className="mt-1.5 block text-xs font-normal text-navy/60">
                  We&apos;ll send your order number and updates to this address.
                </span>
              </label>
            </section>

            <section className="space-y-4">
              <SectionHeading>How would you like to receive your order?</SectionHeading>
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
                    <span className="block text-sm font-medium text-navy">Collect from our shop</span>
                    <span className="mt-1 block text-sm text-navy/70">
                      {BUSINESS.location}
                    </span>
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
                  <span className="text-sm font-medium text-navy">Deliver to me</span>
                </label>
              </fieldset>

              {fulfillment === "DELIVERY" ? (
                <div className="space-y-4 rounded-2xl border border-navy/10 bg-white p-4">
                  <p className="text-sm font-medium text-navy">Delivery address</p>
                  <label className="block text-sm">
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
                  <label className="block text-sm">
                    Town / city <span className="text-coral">*</span>
                    <input
                      name="city"
                      required
                      placeholder="e.g. Westlands, Nakuru, Kisumu"
                      className={fieldClass}
                    />
                  </label>
                  <label className="block text-sm">
                    Street, estate, building or landmark <span className="text-coral">*</span>
                    <textarea
                      name="address"
                      required
                      rows={3}
                      placeholder="e.g. ABC Apartments, Waiyaki Way, near Sarit Centre"
                      className={fieldClass}
                    />
                  </label>
                  <label className="block text-sm">
                    Room / floor / unit no. <span className="text-navy/50">(optional)</span>
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

            {error ? <p className="text-sm text-coral">{error}</p> : null}

            <div className="sticky-safe-bottom safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-navy/10 bg-paper/95 px-4 py-4 backdrop-blur supports-[padding:max(0px)]:pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="site-container-narrow !px-0">
                <button
                  type="submit"
                  disabled={saving}
                  className="min-h-12 w-full rounded-full bg-navy px-4 py-3 text-sm font-medium text-cream disabled:opacity-60"
                >
                  {saving ? "Submitting..." : "Submit order request"}
                </button>
                <p className="mt-3 text-center text-xs text-navy/70">
                  You don&apos;t need to pay yet. We&apos;ll contact you to confirm your order and
                  tell you how to pay.
                </p>
              </div>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
