"use client";

import { CategoryFields } from "@/components/admin/CategoryFields";
import {
  AdminCard,
  AdminNotice,
  adminButtonClass,
  adminInputClass,
  adminLabelClass,
  adminTextareaClass,
} from "@/components/admin/ui";
import { priceWithUnit } from "@/lib/format";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

type Category = {
  id: string;
  name: string;
  isActive: boolean;
  subcategories: { id: string; name: string; isActive: boolean }[];
};

export function NewProductForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [priceKes, setPriceKes] = useState(0);
  const [unit, setUnit] = useState("Box of 100");

  const preview = useMemo(() => priceWithUnit(priceKes || 0, unit || "pack"), [priceKes, unit]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        categoryId,
        categoryName: form.get("categoryName"),
        subcategoryId: form.get("subcategoryId") || null,
        subcategoryName: form.get("subcategoryName"),
        shortDescription: form.get("shortDescription"),
        description: form.get("description"),
        unit: form.get("unit"),
        stockUnit: form.get("stockUnit"),
        priceKes: Number(form.get("priceKes")),
        reorderThreshold: Number(form.get("reorderThreshold") || 5),
        askForAvailability: form.get("askForAvailability") === "on",
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Could not add the product.");
      return;
    }
    router.push(`/admin/products/${data.id}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <AdminCard title="What the customer will see">
        <div className="space-y-4">
          <label className={adminLabelClass}>
            Product name
            <input name="name" required className={`${adminInputClass} mt-1.5`} />
          </label>
          <CategoryFields
            categories={categories}
            categoryId={categoryId}
            subcategoryId={subcategoryId}
            onCategoryChange={setCategoryId}
            onSubcategoryChange={setSubcategoryId}
          />
          <label className={adminLabelClass}>
            One-sentence description
            <input
              name="shortDescription"
              required
              maxLength={140}
              placeholder="Powder-free examination gloves"
              className={`${adminInputClass} mt-1.5`}
            />
          </label>
          <label className={adminLabelClass}>
            Longer description (optional — Velora’s own wording only)
            <textarea name="description" className={`${adminTextareaClass} mt-1.5`} />
          </label>
        </div>
      </AdminCard>

      <AdminCard title="Price">
        <div className="space-y-4">
          <label className={adminLabelClass}>
            Selling price (KSh)
            <input
              name="priceKes"
              type="number"
              min={0}
              required
              onChange={(event) => setPriceKes(Number(event.target.value) || 0)}
              className={`${adminInputClass} mt-1.5`}
            />
          </label>
          <label className={adminLabelClass}>
            Unit / pack size the customer buys
            <input
              name="unit"
              required
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
              placeholder="Box of 100"
              className={`${adminInputClass} mt-1.5`}
            />
          </label>
          <p className="rounded-xl bg-sand/40 px-4 py-3 text-sm text-navy/75">
            Customer will see: <strong className="text-navy">{preview}</strong>
          </p>
        </div>
      </AdminCard>

      <AdminCard title="Stock (only you see the number)">
        <div className="space-y-4">
          <label className={adminLabelClass}>
            What the stock number counts
            <input
              name="stockUnit"
              defaultValue="boxes"
              className={`${adminInputClass} mt-1.5`}
            />
          </label>
          <label className={adminLabelClass}>
            Warn me when stock is at or below
            <input
              name="reorderThreshold"
              type="number"
              min={0}
              defaultValue={5}
              className={`${adminInputClass} mt-1.5`}
            />
          </label>
          <label className="flex items-center gap-2.5 text-sm text-navy/80">
            <input
              name="askForAvailability"
              type="checkbox"
              className="h-4 w-4 rounded border-navy/20 text-teal focus:ring-teal/20"
            />
            Always show “Ask us” instead of In stock / Out of stock
          </label>
          <AdminNotice tone="info">
            New products start hidden. Add a photo on the next screen, then show it in the shop.
          </AdminNotice>
        </div>
      </AdminCard>

      {error ? <AdminNotice tone="warn">{error}</AdminNotice> : null}

      <button type="submit" className={adminButtonClass("primary")}>
        Save and add photo
      </button>
    </form>
  );
}
