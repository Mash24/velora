"use client";

import { CategoryFields } from "@/components/admin/CategoryFields";
import {
  AdminCard,
  AdminNotice,
  adminButtonClass,
  adminInputClass,
  adminLabelClass,
  adminSelectClass,
  adminTextareaClass,
} from "@/components/admin/ui";
import { priceWithUnit } from "@/lib/format";
import { STOCK_CORRECTION_REASONS } from "@/lib/stock-correction-reasons";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

type Image = { id: string; url: string };
type Category = {
  id: string;
  name: string;
  isActive: boolean;
  subcategories: { id: string; name: string; isActive: boolean }[];
};
type Product = {
  id: string;
  name: string;
  sku: string | null;
  shortDescription: string;
  description: string | null;
  unit: string;
  stockUnit: string;
  priceKes: number;
  stockQuantity: number;
  reorderThreshold: number;
  isActive: boolean;
  featured: boolean;
  askForAvailability: boolean;
  categoryId: string;
  subcategoryId: string | null;
  images: Image[];
};

export function ProductEditor({
  product,
  categories,
}: {
  product: Product;
  categories: Category[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [categoryId, setCategoryId] = useState(product.categoryId);
  const [subcategoryId, setSubcategoryId] = useState(product.subcategoryId ?? "");
  const [priceKes, setPriceKes] = useState(product.priceKes);
  const [unit, setUnit] = useState(product.unit);

  const preview = useMemo(() => priceWithUnit(priceKes || 0, unit || "pack"), [priceKes, unit]);

  async function post(body: Record<string, unknown>) {
    setError("");
    setMessage("");
    const response = await fetch(`/api/admin/products/${product.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Could not save.");
      return false;
    }
    setMessage("Saved.");
    router.refresh();
    return true;
  }

  async function saveDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await post({
      action: "update",
      name: form.get("name"),
      shortDescription: form.get("shortDescription"),
      description: form.get("description"),
      unit: form.get("unit"),
      stockUnit: form.get("stockUnit"),
      priceKes: Number(form.get("priceKes")),
      reorderThreshold: Number(form.get("reorderThreshold")),
      isActive: form.get("isActive") === "on",
      featured: form.get("featured") === "on",
      askForAvailability: form.get("askForAvailability") === "on",
      categoryId,
      subcategoryId: subcategoryId || null,
      categoryName: form.get("categoryName"),
      subcategoryName: form.get("subcategoryName"),
    });
  }

  async function receive(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await post({ action: "receive", quantity: Number(form.get("quantity")) });
  }

  async function correct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await post({
      action: "correct",
      countedQuantity: Number(form.get("countedQuantity")),
      reason: form.get("reason"),
    });
  }

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const form = event.currentTarget;
    const response = await fetch(`/api/admin/products/${product.id}/images`, {
      method: "POST",
      body: new FormData(form),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Could not upload the photo.");
      return;
    }
    form.reset();
    const count = typeof data.count === "number" ? data.count : 1;
    setMessage(count > 1 ? `${count} photos added.` : "Photo added.");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={saveDetails}>
        <AdminCard title="What the customer will see">
          <div className="space-y-4">
            <label className={adminLabelClass}>
              Product name
              <input
                name="name"
                defaultValue={product.name}
                className={`${adminInputClass} mt-1.5`}
              />
            </label>
            <CategoryFields
              categories={categories}
              categoryId={categoryId}
              subcategoryId={subcategoryId}
              onCategoryChange={(id) => {
                setCategoryId(id);
                setSubcategoryId("");
              }}
              onSubcategoryChange={setSubcategoryId}
            />
            <label className={adminLabelClass}>
              Short summary
              <span className="mt-0.5 block text-xs font-normal text-navy/55">
                One line under the product name. Example: Powder-free examination gloves for clinic
                and home care.
              </span>
              <input
                name="shortDescription"
                defaultValue={product.shortDescription}
                maxLength={160}
                className={`${adminInputClass} mt-1.5`}
              />
            </label>
            <label className={adminLabelClass}>
              About this product
              <span className="mt-0.5 block text-xs font-normal text-navy/55">
                This is what customers read on the product page. Include what it is, pack size, who
                it is for, and how it is used. Use Velora’s own wording only.
              </span>
              <textarea
                name="description"
                defaultValue={product.description ?? ""}
                rows={12}
                placeholder={"What it is\nPack size\nWho it is for\nHow to use it"}
                className={`${adminTextareaClass} mt-1.5 min-h-48`}
              />
            </label>
            <label className={adminLabelClass}>
              Selling price (KSh)
              <input
                name="priceKes"
                type="number"
                defaultValue={product.priceKes}
                onChange={(event) => setPriceKes(Number(event.target.value) || 0)}
                className={`${adminInputClass} mt-1.5`}
              />
            </label>
            <label className={adminLabelClass}>
              Unit / pack size
              <input
                name="unit"
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
                className={`${adminInputClass} mt-1.5`}
              />
            </label>
            <p className="rounded-xl bg-sand/40 px-4 py-3 text-sm text-navy/75">
              Customer will see: <strong className="text-navy">{preview}</strong>
            </p>
            <label className={adminLabelClass}>
              What the stock number counts
              <input
                name="stockUnit"
                defaultValue={product.stockUnit}
                className={`${adminInputClass} mt-1.5`}
              />
            </label>
            <label className={adminLabelClass}>
              Warn me when stock is at or below
              <input
                name="reorderThreshold"
                type="number"
                defaultValue={product.reorderThreshold}
                className={`${adminInputClass} mt-1.5`}
              />
            </label>
            <div className="space-y-2.5 rounded-xl border border-navy/6 bg-sand/20 px-4 py-3">
              <label className="flex items-center gap-2.5 text-sm text-navy/80">
                <input
                  name="askForAvailability"
                  type="checkbox"
                  defaultChecked={product.askForAvailability}
                  className="h-4 w-4 rounded border-navy/20 text-teal focus:ring-teal/20"
                />
                Always show “Ask us”
              </label>
              <label className="flex items-center gap-2.5 text-sm text-navy/80">
                <input
                  name="isActive"
                  type="checkbox"
                  defaultChecked={product.isActive}
                  className="h-4 w-4 rounded border-navy/20 text-teal focus:ring-teal/20"
                />
                Show in the shop (needs a photo)
              </label>
              <label className="flex items-center gap-2.5 text-sm text-navy/80">
                <input
                  name="featured"
                  type="checkbox"
                  defaultChecked={product.featured}
                  className="h-4 w-4 rounded border-navy/20 text-teal focus:ring-teal/20"
                />
                Show on the home page
              </label>
            </div>
            <button type="submit" className={adminButtonClass("primary")}>
              Save details
            </button>
          </div>
        </AdminCard>
      </form>

      <AdminCard
        title="Photos"
        description="Customers swipe through these on the product page. Add several angles if you have them."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {product.images.map((image) => (
            <div key={image.id} className="group relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt=""
                className="h-32 w-full rounded-xl border border-navy/8 object-cover"
              />
              <button
                type="button"
                onClick={() => post({ action: "delete-image", imageId: image.id })}
                className={`${adminButtonClass("danger")} mt-2 text-xs`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <form onSubmit={upload} className="mt-4 space-y-3 border-t border-navy/6 pt-4">
          <label className={adminLabelClass}>
            Add photos
            <input
              name="file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              required
              className="mt-1.5 block w-full text-sm text-navy/70 file:mr-3 file:rounded-lg file:border-0 file:bg-navy/8 file:px-3 file:py-2 file:text-sm file:font-medium file:text-navy"
            />
          </label>
          <button type="submit" className={adminButtonClass("secondary")}>
            Upload photos
          </button>
        </form>
      </AdminCard>

      <div className="grid gap-4 sm:grid-cols-2">
        <AdminCard title="Current stock">
          <p className="text-3xl font-semibold tabular-nums text-navy">
            {product.stockQuantity}{" "}
            <span className="text-lg font-normal text-navy/60">{product.stockUnit}</span>
          </p>
          <p className="mt-2 text-sm text-navy/60">
            Customers never see this number. They only see In stock, Out of stock, or Ask us.
          </p>
        </AdminCard>

        <AdminCard title="Receive new stock">
          <form onSubmit={receive} className="space-y-3">
            <label className={adminLabelClass}>
              Quantity received
              <input
                name="quantity"
                type="number"
                min={1}
                required
                className={`${adminInputClass} mt-1.5`}
              />
            </label>
            <button type="submit" className={adminButtonClass("secondary")}>
              Add to stock
            </button>
          </form>
        </AdminCard>
      </div>

      <AdminCard title="Correct stock">
        <form onSubmit={correct} className="space-y-4">
          <label className={adminLabelClass}>
            Count on the shelf now
            <input
              name="countedQuantity"
              type="number"
              min={0}
              required
              className={`${adminInputClass} mt-1.5`}
            />
          </label>
          <label className={adminLabelClass}>
            Reason
            <select name="reason" required className={`${adminSelectClass} mt-1.5`}>
              {STOCK_CORRECTION_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className={adminButtonClass("secondary")}>
            Set stock to this count
          </button>
        </form>
      </AdminCard>

      {error ? <AdminNotice tone="warn">{error}</AdminNotice> : null}
      {message ? <AdminNotice tone="success">{message}</AdminNotice> : null}
    </div>
  );
}
