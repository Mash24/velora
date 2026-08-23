"use client";

import { formatKes } from "@/lib/format";
import { mergeOrderNotes, splitOrderNotes } from "@/lib/order-notes";
import {
  adminButtonClass,
  adminInputClass,
  adminSelectClass,
  adminTextareaClass,
} from "@/components/admin/ui";
import { useRouter } from "next/navigation";
import { FormEvent, MouseEvent, useMemo, useState } from "react";

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
  items,
  notes,
  paymentMethod,
  deliveryFeeKes,
  products,
  pickup,
}: {
  orderId: string;
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
    setMessage("Saved.");
    setBusy(false);
    router.refresh();
    return true;
  }

  async function confirm(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    const formEl = event.currentTarget.form;
    if (!formEl) return;
    if (!window.confirm("Confirm this sale? Stock will be taken off the shelf now.")) return;
    setBusy(true);
    setError("");
    setMessage("");
    const form = new FormData(formEl);
    const saved = await post("update-enquiry", form);
    if (!saved.ok) {
      setBusy(false);
      setError(saved.data.error ?? "Could not save the order.");
      return;
    }
    const confirmed = await post("confirm", form);
    setBusy(false);
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
      <div>
        <h2 className="font-medium">Confirm this order</h2>
        <p className="mt-1 text-sm text-navy/70">
          Adjust quantities if needed, quote delivery, then confirm. Stock is taken when you confirm.
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-navy/50">Products requested</p>
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
            <label className="text-sm">
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
          className="text-sm text-teal"
        >
          Add a product
        </button>
      </div>

      <dl className="space-y-2 border-t border-navy/10 pt-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-navy/70">Products</dt>
          <dd className="font-medium tabular-nums">{formatKes(productTotal)}</dd>
        </div>
        {!pickup ? (
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <dt className="text-navy/70">Delivery fee</dt>
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
        <div className="flex justify-between gap-4 border-t border-navy/10 pt-2 font-medium">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatKes(total)}</dd>
        </div>
      </dl>

      <label className="block text-sm">
        How they&apos;ll pay
        <select
          name="paymentMethod"
          defaultValue={paymentMethod}
          className={adminSelectClass}
        >
          <option value="PAY_ON_DELIVERY">Pay on delivery</option>
          <option value="MPESA">M-Pesa first</option>
          <option value="CASH">Cash</option>
          <option value="OTHER">Other</option>
        </select>
      </label>

      <label className="block text-sm">
        Your notes <span className="text-navy/50">(optional)</span>
        <textarea
          name="staffNote"
          rows={2}
          placeholder="Anything for your team — not shown to the customer"
          className={adminTextareaClass}
        />
      </label>

      {error ? <p className="text-sm text-coral">{error}</p> : null}
      {message ? <p className="text-sm text-teal">{message}</p> : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button disabled={busy} className={adminButtonClass("secondary")}>
          Save changes
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={confirm}
          className={adminButtonClass("primary")}
        >
          Confirm sale
        </button>
      </div>
    </form>
  );
}
