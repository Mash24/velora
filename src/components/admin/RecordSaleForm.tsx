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
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

type Product = { id: string; name: string; priceKes: number; stockQuantity: number };

export function RecordSaleForm({ products }: { products: Product[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [lines, setLines] = useState([{ productId: products[0]?.id ?? "", quantity: 1 }]);

  const estimated = useMemo(() => {
    return lines.reduce((sum, line) => {
      const product = products.find((item) => item.id === line.productId);
      return sum + (product ? product.priceKes * line.quantity : 0);
    }, 0);
  }, [lines, products]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        phone: form.get("phone"),
        address: form.get("address"),
        zone: form.get("zone"),
        source: form.get("source"),
        paymentMethod: form.get("paymentMethod"),
        paymentStatus: form.get("paymentStatus"),
        mpesaCode: form.get("mpesaCode"),
        notes: form.get("notes"),
        items: lines,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Could not record the sale.");
      return;
    }
    router.push(`/admin/orders/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <AdminCard title="Customer">
        <div className="space-y-4">
          <label className={adminLabelClass}>
            Customer name
            <input name="name" required className={`${adminInputClass} mt-1.5`} />
          </label>
          <label className={adminLabelClass}>
            Phone
            <input name="phone" required className={`${adminInputClass} mt-1.5`} />
          </label>
          <label className={adminLabelClass}>
            Location / address
            <textarea
              name="address"
              required
              placeholder="Delivery address, or write Customer collecting"
              className={`${adminTextareaClass} mt-1.5`}
            />
          </label>
          <label className={adminLabelClass}>
            Delivery
            <select name="zone" className={`${adminSelectClass} mt-1.5`}>
              <option value="NAIROBI">Nairobi delivery</option>
              <option value="UPCOUNTRY">Outside Nairobi</option>
            </select>
          </label>
          <label className={adminLabelClass}>
            How they found us
            <select name="source" defaultValue="WALK_IN" className={`${adminSelectClass} mt-1.5`}>
              <option value="WALK_IN">Shop visit</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="TIKTOK">TikTok</option>
              <option value="WEBSITE">Website</option>
              <option value="REFERRAL">Referral</option>
            </select>
          </label>
        </div>
      </AdminCard>

      <AdminCard title="Products">
        <div className="space-y-3">
          {lines.map((line, index) => (
            <div key={index} className="flex gap-2">
              <select
                value={line.productId}
                onChange={(event) => {
                  const next = [...lines];
                  next[index] = { ...next[index], productId: event.target.value };
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
              <input
                type="number"
                min={1}
                value={line.quantity}
                onChange={(event) => {
                  const next = [...lines];
                  next[index] = { ...next[index], quantity: Number(event.target.value) || 1 };
                  setLines(next);
                }}
                className={`${adminInputClass} w-20`}
                aria-label="Quantity"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => setLines([...lines, { productId: products[0]?.id ?? "", quantity: 1 }])}
            className={adminButtonClass("ghost")}
          >
            + Add another product
          </button>
        </div>
      </AdminCard>

      <AdminCard title="Payment">
        <div className="space-y-4">
          <label className={adminLabelClass}>
            Payment method
            <select name="paymentMethod" className={`${adminSelectClass} mt-1.5`}>
              <option value="CASH">Cash</option>
              <option value="MPESA">M-Pesa</option>
              <option value="PAY_ON_DELIVERY">Pay on delivery</option>
            </select>
          </label>
          <label className={adminLabelClass}>
            Paid now?
            <select name="paymentStatus" className={`${adminSelectClass} mt-1.5`}>
              <option value="PAID">Yes, paid</option>
              <option value="UNPAID">Not yet</option>
            </select>
          </label>
          <label className={adminLabelClass}>
            M-Pesa code (if any)
            <input name="mpesaCode" className={`${adminInputClass} mt-1.5`} />
          </label>
          <label className={adminLabelClass}>
            Notes
            <textarea name="notes" className={`${adminTextareaClass} mt-1.5`} />
          </label>
        </div>
      </AdminCard>

      <div className="rounded-2xl border border-navy/8 bg-sand/30 px-5 py-4">
        <p className="text-sm text-navy/60">Estimated total</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-navy">{formatKes(estimated)}</p>
      </div>

      {error ? <AdminNotice tone="warn">{error}</AdminNotice> : null}

      <button type="submit" className={`${adminButtonClass("primary")} min-h-12 w-full`}>
        Record sale
      </button>
    </form>
  );
}
