"use client";

import {
  AdminCard,
  AdminNotice,
  adminButtonClass,
  adminInputClass,
  adminLabelClass,
  adminSelectClass,
  adminTextareaClass,
} from "@/components/admin/ui";
import { formatKes } from "@/lib/format";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useRef, useState } from "react";

type Product = {
  id: string;
  name: string;
  priceKes: number;
  stockQuantity: number;
  stockUnit: string;
  isActive: boolean;
};

type Line = { key: string; productId: string; quantity: number };
type Fulfillment = "pickup" | "delivery";
type PaymentMode = "cash" | "mpesa" | "later";

function newKey() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function RecordSaleForm({ products }: { products: Product[] }) {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [query, setQuery] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [fulfillment, setFulfillment] = useState<Fulfillment>("pickup");
  const [address, setAddress] = useState("");
  const [zone, setZone] = useState<"NAIROBI" | "UPCOUNTRY">("NAIROBI");
  const [deliveryFee, setDeliveryFee] = useState<number | "">(0);
  const [source, setSource] = useState("WALK_IN");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("cash");
  const [mpesaCode, setMpesaCode] = useState("");
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? products.filter((p) => p.name.toLowerCase().includes(q))
      : products;
    return list.slice(0, 8);
  }, [products, query]);

  const lineDetails = lines.map((line) => {
    const product = productMap.get(line.productId);
    const overStock = product ? line.quantity > product.stockQuantity : false;
    return { ...line, product, overStock, lineTotal: product ? product.priceKes * line.quantity : 0 };
  });

  const subtotal = lineDetails.reduce((sum, line) => sum + line.lineTotal, 0);
  const fee = fulfillment === "delivery" ? Number(deliveryFee) || 0 : 0;
  const total = subtotal + fee;
  const stockIssue = lineDetails.some((line) => line.overStock || !line.product);
  const canSubmit = lines.length > 0 && name.trim() && phone.trim() && !stockIssue && !busy;

  function addProduct(productId: string) {
    setLines((prev) => {
      const existing = prev.find((line) => line.productId === productId);
      if (existing) {
        return prev.map((line) =>
          line.productId === productId ? { ...line, quantity: line.quantity + 1 } : line,
        );
      }
      return [...prev, { key: newKey(), productId, quantity: 1 }];
    });
    setQuery("");
    setPickerOpen(false);
    searchRef.current?.focus();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setError("");

    const response = await fetch("/api/admin/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone,
        fulfillment: fulfillment === "pickup" ? "PICKUP" : "DELIVERY",
        address,
        zone,
        source,
        paymentMode,
        mpesaCode,
        notes,
        deliveryFeeKes: fee,
        items: lines.map((line) => ({ productId: line.productId, quantity: line.quantity })),
      }),
    });
    const data = await response.json();
    setBusy(false);

    if (!response.ok) {
      setError(data.error ?? "Could not record the sale.");
      return;
    }

    router.push(`/admin/orders/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <AdminCard title="Products" description="What is the customer buying?">
        <div className="relative">
          <label className={adminLabelClass} htmlFor="sale-product-search">
            Add a product
          </label>
          <input
            ref={searchRef}
            id="sale-product-search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPickerOpen(true);
            }}
            onFocus={() => setPickerOpen(true)}
            onBlur={() => {
              // Allow click on option before closing
              window.setTimeout(() => setPickerOpen(false), 150);
            }}
            placeholder="Search by name…"
            className={`${adminInputClass} mt-1.5`}
            autoComplete="off"
          />
          {pickerOpen ? (
            <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-navy/10 bg-white py-1 shadow-lg">
              {filtered.length === 0 ? (
                <li className="px-3.5 py-3 text-sm text-navy/55">No products match.</li>
              ) : (
                filtered.map((product) => (
                  <li key={product.id}>
                    <button
                      type="button"
                      className="flex w-full items-start justify-between gap-3 px-3.5 py-2.5 text-left hover:bg-sand/50"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => addProduct(product.id)}
                    >
                      <span className="min-w-0">
                        <span className="block font-medium text-navy">{product.name}</span>
                        <span className="mt-0.5 block text-xs text-navy/55">
                          {product.stockQuantity} {product.stockUnit} on shelf
                          {!product.isActive ? " · hidden from website" : ""}
                        </span>
                      </span>
                      <span className="shrink-0 tabular-nums text-sm font-semibold text-navy">
                        {formatKes(product.priceKes)}
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          ) : null}
        </div>

        {lines.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-navy/15 bg-sand/20 px-4 py-6 text-center text-sm text-navy/60">
            Search above to add the first product.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-navy/8">
            {lineDetails.map((line, index) => (
              <li key={line.key} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-navy">{line.product?.name ?? "Unknown product"}</p>
                  <p className="text-xs text-navy/55">
                    {line.product
                      ? `${formatKes(line.product.priceKes)} each · ${line.product.stockQuantity} ${line.product.stockUnit} left`
                      : "—"}
                  </p>
                  {line.overStock ? (
                    <p className="mt-1 text-xs font-medium text-coral">
                      Only {line.product?.stockQuantity ?? 0} in stock
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <label className="sr-only" htmlFor={`qty-${line.key}`}>
                    Quantity
                  </label>
                  <input
                    id={`qty-${line.key}`}
                    type="number"
                    min={1}
                    max={line.product?.stockQuantity ?? undefined}
                    value={line.quantity}
                    onChange={(event) => {
                      const quantity = Math.max(1, Math.floor(Number(event.target.value) || 1));
                      setLines((prev) =>
                        prev.map((item, i) => (i === index ? { ...item, quantity } : item)),
                      );
                    }}
                    className={`${adminInputClass} w-20`}
                  />
                  <span className="w-24 text-right text-sm font-semibold tabular-nums text-navy">
                    {formatKes(line.lineTotal)}
                  </span>
                  <button
                    type="button"
                    className="text-sm font-medium text-navy/45 hover:text-coral"
                    onClick={() => setLines((prev) => prev.filter((_, i) => i !== index))}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>

      <AdminCard title="Customer">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={adminLabelClass}>
            Name <span className="text-coral">*</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              placeholder="Customer name"
              className={`${adminInputClass} mt-1.5`}
              autoComplete="name"
            />
          </label>
          <label className={adminLabelClass}>
            Phone <span className="text-coral">*</span>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
              placeholder="07XX XXX XXX"
              className={`${adminInputClass} mt-1.5`}
              autoComplete="tel"
              inputMode="tel"
            />
          </label>
        </div>
        <label className={`${adminLabelClass} mt-4`}>
          How they found us
          <select
            value={source}
            onChange={(event) => setSource(event.target.value)}
            className={`${adminSelectClass} mt-1.5`}
          >
            <option value="WALK_IN">Shop visit</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="TIKTOK">TikTok</option>
            <option value="WEBSITE">Website / call after browsing</option>
            <option value="REFERRAL">Referral</option>
            <option value="OTHER">Other</option>
          </select>
        </label>
      </AdminCard>

      <AdminCard title="Collect or deliver">
        <div className="grid grid-cols-2 gap-2">
          <Choice
            active={fulfillment === "pickup"}
            title="Collecting now"
            subtitle="At the shop"
            onClick={() => {
              setFulfillment("pickup");
              if (paymentMode === "later") setPaymentMode("cash");
            }}
          />
          <Choice
            active={fulfillment === "delivery"}
            title="Delivery"
            subtitle="Send out later"
            onClick={() => setFulfillment("delivery")}
          />
        </div>

        {fulfillment === "pickup" ? (
          <p className="mt-4 rounded-xl bg-teal/5 px-3.5 py-3 text-sm text-navy/75">
            If they pay now, this sale is recorded as <strong>collected and closed</strong> — no
            extra steps after.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            <label className={adminLabelClass}>
              Delivery address <span className="text-coral">*</span>
              <textarea
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                required={fulfillment === "delivery"}
                rows={2}
                placeholder="Building, street, area…"
                className={`${adminTextareaClass} mt-1.5`}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={adminLabelClass}>
                Area
                <select
                  value={zone}
                  onChange={(event) => setZone(event.target.value as "NAIROBI" | "UPCOUNTRY")}
                  className={`${adminSelectClass} mt-1.5`}
                >
                  <option value="NAIROBI">Nairobi</option>
                  <option value="UPCOUNTRY">Outside Nairobi</option>
                </select>
              </label>
              <label className={adminLabelClass}>
                Delivery fee (KSh)
                <input
                  type="number"
                  min={0}
                  value={deliveryFee}
                  onChange={(event) =>
                    setDeliveryFee(
                      event.target.value === "" ? "" : Math.max(0, Number(event.target.value) || 0),
                    )
                  }
                  className={`${adminInputClass} mt-1.5`}
                />
              </label>
            </div>
          </div>
        )}
      </AdminCard>

      <AdminCard title="Payment">
        <div className="grid gap-2 sm:grid-cols-3">
          <Choice
            active={paymentMode === "cash"}
            title="Cash"
            subtitle="Paid now"
            onClick={() => setPaymentMode("cash")}
          />
          <Choice
            active={paymentMode === "mpesa"}
            title="M-Pesa"
            subtitle="Paid now"
            onClick={() => setPaymentMode("mpesa")}
          />
          <Choice
            active={paymentMode === "later"}
            title="Not paid yet"
            subtitle={fulfillment === "pickup" ? "Pay later" : "Pay on delivery"}
            onClick={() => setPaymentMode("later")}
          />
        </div>
        {paymentMode === "mpesa" ? (
          <label className={`${adminLabelClass} mt-4`}>
            M-Pesa code <span className="font-normal text-navy/50">(optional)</span>
            <input
              value={mpesaCode}
              onChange={(event) => setMpesaCode(event.target.value)}
              className={`${adminInputClass} mt-1.5`}
              placeholder="e.g. QH7…"
            />
          </label>
        ) : null}
      </AdminCard>

      {showNotes ? (
        <AdminCard title="Notes">
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={2}
            placeholder="Anything for your team…"
            className={adminTextareaClass}
          />
        </AdminCard>
      ) : (
        <button
          type="button"
          onClick={() => setShowNotes(true)}
          className="text-sm font-medium text-navy/55 underline-offset-2 hover:text-teal hover:underline"
        >
          + Add a note
        </button>
      )}

      {error ? <AdminNotice tone="warn">{error}</AdminNotice> : null}

      <div className="admin-sticky-action rounded-2xl border border-navy/10 bg-cream/95 p-4 shadow-[0_8px_30px_rgba(22,52,76,0.12)] backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-navy/55">Total</p>
            <p className="text-xl font-semibold tabular-nums text-navy">{formatKes(total)}</p>
            {fee > 0 ? (
              <p className="text-xs text-navy/50">
                Products {formatKes(subtotal)} + delivery {formatKes(fee)}
              </p>
            ) : null}
          </div>
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
            <Link href="/admin/orders" className={`${adminButtonClass("secondary")} w-full sm:w-auto`}>
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`${adminButtonClass("primary")} w-full sm:min-w-40 sm:w-auto`}
            >
              {busy
                ? "Saving…"
                : fulfillment === "pickup" && paymentMode !== "later"
                  ? "Record & close"
                  : "Record sale"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

function Choice({
  active,
  title,
  subtitle,
  onClick,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3 py-3 text-left transition ${
        active
          ? "border-teal/40 bg-teal/5 shadow-sm"
          : "border-navy/10 bg-white hover:border-navy/20"
      }`}
    >
      <span className={`block text-sm font-semibold ${active ? "text-navy" : "text-navy/80"}`}>
        {title}
      </span>
      <span className="mt-0.5 block text-xs text-navy/55">{subtitle}</span>
    </button>
  );
}
