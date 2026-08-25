"use client";

import { formatKes } from "@/lib/format";
import { mergeOrderNotes, splitOrderNotes } from "@/lib/order-notes";
import {
  AdminNotice,
  adminButtonClass,
  adminInputClass,
  adminSelectClass,
  adminTextareaClass,
} from "@/components/admin/ui";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

type Line = {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  unitPriceKes: number;
  lineTotalKes: number;
};
type Product = { id: string; name: string; stockQuantity: number; priceKes: number };

export function EnquiryEditor({
  orderId,
  customerPhone,
  items,
  notes,
  paymentMethod,
  deliveryFeeKes,
  products,
  pickup,
}: {
  orderId: string;
  customerPhone: string;
  items: Line[];
  notes: string;
  paymentMethod: string;
  deliveryFeeKes: number;
  products: Product[];
  pickup: boolean;
}) {
  const router = useRouter();
  const { systemNotes, customerNote } = useMemo(() => splitOrderNotes(notes), [notes]);
  const [lines, setLines] = useState(
    items.map((item) => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      unitPriceKes: item.unitPriceKes,
    })),
  );
  const [fee, setFee] = useState(deliveryFeeKes);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const productTotal = lines.reduce(
    (sum, line) => sum + line.unitPriceKes * Math.max(0, line.quantity),
    0,
  );
  const total = productTotal + (pickup ? 0 : fee);

  async function post(action: string, form: FormData) {
    const staffNote = String(form.get("staffNote") ?? "").trim();
    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        items: lines.filter((line) => line.quantity > 0),
        notes: mergeOrderNotes(systemNotes, customerNote, staffNote),
        paymentMethod: form.get("paymentMethod"),
        deliveryFeeKes: pickup ? 0 : form.get("deliveryFeeKes"),
      }),
    });
    return response.json().then((data) => ({ ok: response.ok, data }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const saved = await post("update-enquiry", form);
    if (!saved.ok) {
      setBusy(false);
      setError(saved.data.error ?? "Could not save the order.");
      return false;
    }
    setMessage("Saved for later.");
    setBusy(false);
    router.refresh();
    return true;
  }

  async function confirmSale(formEl: HTMLFormElement) {
    setBusy(true);
    setError("");
    setMessage("");
    const form = new FormData(formEl);
    const saved = await post("update-enquiry", form);
    if (!saved.ok) {
      setBusy(false);
      setConfirmOpen(false);
      setError(saved.data.error ?? "Could not save the order.");
      return;
    }
    const confirmed = await post("confirm", form);
    setBusy(false);
    setConfirmOpen(false);
    if (!confirmed.ok) {
      setError(confirmed.data.error ?? "Could not confirm the order.");
      return;
    }
    router.refresh();
  }

  return (
    <form
      onSubmit={save}
      className="mt-4 space-y-5 rounded-2xl border border-navy/8 bg-white p-5 shadow-[0_1px_2px_rgba(22,52,76,0.04),0_8px_24px_rgba(22,52,76,0.04)]"
    >
      <div className="rounded-xl border border-teal/25 bg-teal/5 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">Do this next</p>
        <ol className="mt-3 space-y-3 text-sm text-navy/85">
          <li className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-navy text-xs font-semibold text-cream">
                1
              </span>
              Call the customer to confirm what they need
            </span>
            <a href={`tel:${customerPhone}`} className={`${adminButtonClass("secondary")} shrink-0`}>
              Call customer
            </a>
          </li>
          <li className="flex items-start gap-2">
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-semibold text-cream">
              2
            </span>
            <span>
              Check the products below
              {!pickup ? " and set the delivery fee" : ""}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-semibold text-cream">
              3
            </span>
            <span>Press Confirm sale — stock comes off the shelf then</span>
          </li>
        </ol>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-navy">Products</p>
        {lines.map((line, index) => (
          <div key={`${line.productId}-${index}`} className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <select
              value={line.productId}
              onChange={(event) => {
                const product = products.find((item) => item.id === event.target.value);
                const next = [...lines];
                next[index] = {
                  productId: event.target.value,
                  name: product?.name ?? line.name,
                  quantity: line.quantity,
                  unitPriceKes: product?.priceKes ?? line.unitPriceKes,
                };
                setLines(next);
              }}
              className={`${adminSelectClass} flex-1`}
            >
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.stockQuantity} in stock)
                </option>
              ))}
            </select>
            <label className="text-sm font-medium text-navy/80">
              Qty
              <input
                type="number"
                min={0}
                value={line.quantity}
                onChange={(event) => {
                  const next = [...lines];
                  next[index] = { ...next[index], quantity: Number(event.target.value) || 0 };
                  setLines(next);
                }}
                className={`${adminInputClass} ml-2 w-20`}
              />
            </label>
            <span className="pb-2 text-sm tabular-nums text-navy/70 sm:min-w-24 sm:text-right">
              {formatKes(line.unitPriceKes * Math.max(0, line.quantity))}
            </span>
          </div>
        ))}
        <button
          type="button"
          onClick={() => {
            const product = products[0];
            if (!product) return;
            setLines([
              ...lines,
              {
                productId: product.id,
                name: product.name,
                quantity: 1,
                unitPriceKes: product.priceKes,
              },
            ]);
          }}
          className={adminButtonClass("secondary")}
        >
          Add another product
        </button>
      </div>

      <dl className="space-y-2 border-t border-navy/10 pt-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-navy/70">Products</dt>
          <dd className="font-medium tabular-nums">{formatKes(productTotal)}</dd>
        </div>
        {!pickup ? (
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <dt className="font-medium text-navy/80">Delivery fee (KSh)</dt>
            <dd>
              <input
                name="deliveryFeeKes"
                type="number"
                min={0}
                value={fee}
                onChange={(event) => setFee(Math.max(0, Number(event.target.value) || 0))}
                className={`${adminInputClass} sm:w-36`}
              />
            </dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-4 border-t border-navy/10 pt-2 text-base font-semibold">
          <dt>Total to charge</dt>
          <dd className="tabular-nums">{formatKes(total)}</dd>
        </div>
      </dl>

      <label className="block text-sm font-medium text-navy/80">
        How they&apos;ll pay
        <select name="paymentMethod" defaultValue={paymentMethod} className={`${adminSelectClass} mt-1.5`}>
          <option value="PAY_ON_DELIVERY">Pay on delivery</option>
          <option value="MPESA">M-Pesa first</option>
          <option value="CASH">Cash</option>
          <option value="OTHER">Other</option>
        </select>
      </label>

      <label className="block text-sm font-medium text-navy/80">
        Your notes <span className="font-normal text-navy/50">(optional)</span>
        <textarea
          name="staffNote"
          rows={2}
          placeholder="Anything for your team — not shown to the customer"
          className={`${adminTextareaClass} mt-1.5`}
        />
      </label>

      {error ? <AdminNotice tone="warn">{error}</AdminNotice> : null}
      {message ? <AdminNotice tone="success">{message}</AdminNotice> : null}

      {confirmOpen ? (
        <div className="space-y-3 rounded-xl border border-navy/15 bg-sand/40 p-4">
          <p className="font-semibold text-navy">Confirm this sale?</p>
          <p className="text-sm text-navy/75">
            Total <strong>{formatKes(total)}</strong>. Stock for these products will be taken off the
            shelf now.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled={busy}
              onClick={(event) => {
                const formEl = event.currentTarget.form;
                if (formEl) void confirmSale(formEl);
              }}
              className={`${adminButtonClass("primary")} w-full sm:flex-1`}
            >
              {busy ? "Confirming…" : "Yes, confirm sale"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirmOpen(false)}
              className={`${adminButtonClass("secondary")} w-full sm:w-auto`}
            >
              Not yet
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => setConfirmOpen(true)}
            className={`${adminButtonClass("primary")} w-full min-h-12 text-base font-semibold`}
          >
            Confirm sale
          </button>
          <button type="submit" disabled={busy} className={`${adminButtonClass("secondary")} w-full`}>
            Save for later
          </button>
        </div>
      )}
    </form>
  );
}
