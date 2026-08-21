"use client";

import { formatKes } from "@/lib/format";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type Product = {
  id: string;
  name: string;
  priceKes: number;
  unit: string;
};

export function OrderForm({ product }: { product: Product }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setError("");
    const form = new FormData(event.currentTarget);

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        phone: form.get("phone"),
        address: form.get("address"),
        zone: form.get("zone"),
        source: form.get("source"),
        notes: form.get("notes"),
        items: [{ productId: product.id, quantity: Number(form.get("quantity") || 1) }],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      setStatus("error");
      setError(data.error ?? "Could not record the order.");
      return;
    }

    window.open(data.whatsappUrl, "_blank");
    router.push(`/order/${data.orderNumber}`);
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-2xl bg-white p-5 shadow-[0_10px_30px_rgba(18,50,74,0.06)]">
      <div>
        <p className="text-sm font-medium text-navy">Order {product.name}</p>
        <p className="text-sm text-navy/70">{formatKes(product.priceKes)} / {product.unit}</p>
      </div>
      <label className="block text-sm text-navy">
        Quantity
        <input
          name="quantity"
          type="number"
          min={1}
          defaultValue={1}
          className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2"
        />
      </label>
      <label className="block text-sm text-navy">
        Your name
        <input name="name" required className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2" />
      </label>
      <label className="block text-sm text-navy">
        Phone
        <input name="phone" required className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2" />
      </label>
      <label className="block text-sm text-navy">
        Delivery address
        <textarea name="address" required className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2" />
      </label>
      <label className="block text-sm text-navy">
        Delivery area
        <select name="zone" className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2">
          <option value="NAIROBI">Nairobi — pay on delivery allowed</option>
          <option value="UPCOUNTRY">Outside Nairobi — pay before dispatch</option>
        </select>
      </label>
      <label className="block text-sm text-navy">
        How did you find us?
        <select name="source" className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2">
          <option value="WEBSITE">Website</option>
          <option value="TIKTOK">TikTok</option>
          <option value="WHATSAPP">WhatsApp</option>
          <option value="GOOGLE">Google</option>
          <option value="REFERRAL">Referral</option>
          <option value="JUMIA">Jumia</option>
          <option value="WALK_IN">Shop visit</option>
        </select>
      </label>
      <label className="block text-sm text-navy">
        Notes
        <textarea name="notes" className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2" />
      </label>
      {error ? <p className="text-sm text-coral">{error}</p> : null}
      <button
        disabled={status === "saving"}
        className="w-full rounded-full bg-navy px-4 py-3 text-sm font-medium text-cream disabled:opacity-60"
      >
        {status === "saving" ? "Recording order..." : "Record order and continue on WhatsApp"}
      </button>
    </form>
  );
}
