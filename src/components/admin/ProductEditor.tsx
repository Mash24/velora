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
  const [busy, setBusy] = useState(false);
  const [categoryId, setCategoryId] = useState(product.categoryId);
  const [subcategoryId, setSubcategoryId] = useState(product.subcategoryId ?? "");
  const [priceKes, setPriceKes] = useState(product.priceKes);
  const [unit, setUnit] = useState(product.unit);

  const preview = useMemo(() => priceWithUnit(priceKes || 0, unit || "pack"), [priceKes, unit]);
  const hasPhoto = product.images.length > 0;

  async function post(body: Record<string, unknown>) {
    setError("");
    setMessage("");
    setBusy(true);
    const response = await fetch(`/api/admin/products/${product.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) {
      setError(data.error ?? "Could not save.");
      return false;
    }
    setMessage(
      data.unpublished
        ? "Photo removed. Product hidden from the shop — add a photo to publish again."
        : "Saved.",
    );
    router.refresh();
    return true;
  }

  async function toggleShop() {
    if (!product.isActive && !hasPhoto) {
      setError("Add a photo first, then you can put this in the shop.");
      return;
    }
    await post({
      action: "update",
      name: product.name,
      shortDescription: product.shortDescription,
      description: product.description,
      unit: product.unit,
      stockUnit: product.stockUnit,
      priceKes: product.priceKes,
      reorderThreshold: product.reorderThreshold,
      isActive: !product.isActive,
      featured: product.featured,
      askForAvailability: product.askForAvailability,
      categoryId: product.categoryId,
      subcategoryId: product.subcategoryId,
    });
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
    const ok = await post({ action: "receive", quantity: Number(form.get("quantity")) });
    if (ok) event.currentTarget.reset();
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
    setBusy(true);
    const form = event.currentTarget;
    const response = await fetch(`/api/admin/products/${product.id}/images`, {
      method: "POST",
      body: new FormData(form),
    });
    const data = await response.json();
    setBusy(false);
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
    <div className="space-y-5">
      <div
        className={`rounded-2xl border-2 px-4 py-4 sm:px-5 ${
          product.isActive ? "border-teal bg-teal/5" : "border-coral/40 bg-coral/5"
        }`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-base font-semibold text-navy">
              {product.isActive ? "This product is in the shop" : "This product is hidden"}
            </p>
            <p className="mt-1 text-sm text-navy/70">
              {product.isActive
                ? "Customers can find and order it."
                : hasPhoto
                  ? "Saved, but customers cannot see it yet."
                  : "Add a photo, then put it in the shop."}
            </p>
          </div>
          <button
            type="button"
            disabled={busy || (!product.isActive && !hasPhoto)}
            onClick={() => void toggleShop()}
            className={`${adminButtonClass(product.isActive ? "secondary" : "primary")} w-full shrink-0 sm:w-auto`}
          >
            {product.isActive ? "Hide from shop" : "Put in the shop"}
          </button>
        </div>
      </div>

      {error ? <AdminNotice tone="warn">{error}</AdminNotice> : null}
      {message ? <AdminNotice tone="success">{message}</AdminNotice> : null}

      <AdminCard title="Photos" description="At least one photo is needed before customers can see the product.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {product.images.map((image) => (
            <div key={image.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt=""
                className="h-32 w-full rounded-xl border border-navy/8 object-cover"
              />
              <button
                type="button"
                disabled={busy}
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
              className="mt-1.5 block w-full text-sm text-navy/70 file:mr-3 file:rounded-lg file:border-0 file:bg-teal/15 file:px-3 file:py-2.5 file:text-sm file:font-semibold file:text-teal"
            />
          </label>
          <button type="submit" disabled={busy} className={`${adminButtonClass("primary")} w-full sm:w-auto`}>
            Upload photos
          </button>
        </form>
      </AdminCard>

      <form onSubmit={saveDetails}>
        <AdminCard title="Product details">
          <div className="space-y-4">
            <label className={adminLabelClass}>
              Product name
              <input name="name" defaultValue={product.name} className={`${adminInputClass} mt-1.5`} />
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
              <input
                name="shortDescription"
                defaultValue={product.shortDescription}
                maxLength={160}
                className={`${adminInputClass} mt-1.5`}
              />
            </label>
            <label className={adminLabelClass}>
              About this product
              <textarea
                name="description"
                defaultValue={product.description ?? ""}
                rows={6}
                className={`${adminTextareaClass} mt-1.5`}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
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
                Pack size
                <input
                  name="unit"
                  value={unit}
                  onChange={(event) => setUnit(event.target.value)}
                  className={`${adminInputClass} mt-1.5`}
                />
              </label>
            </div>
            <p className="rounded-xl bg-sand/40 px-4 py-3 text-sm text-navy/75">
              Customer will see: <strong className="text-navy">{preview}</strong>
            </p>
            <input type="hidden" name="stockUnit" value={product.stockUnit} />
            <input type="hidden" name="reorderThreshold" value={product.reorderThreshold} />
            {/* Keep publish state when saving details — controlled by the big button above */}
            <input type="hidden" name="isActive" value={product.isActive ? "on" : ""} />
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
                name="featured"
                type="checkbox"
                defaultChecked={product.featured}
                className="h-4 w-4 rounded border-navy/20 text-teal focus:ring-teal/20"
              />
              Feature on the home page
            </label>
            <button type="submit" disabled={busy} className={`${adminButtonClass("primary")} w-full sm:w-auto`}>
              Save changes
            </button>
          </div>
        </AdminCard>
      </form>

      <div className="grid gap-4 sm:grid-cols-2">
        <AdminCard title="On the shelf">
          <p className="text-3xl font-semibold tabular-nums text-navy">
            {product.stockQuantity}{" "}
            <span className="text-lg font-normal text-navy/60">{product.stockUnit}</span>
          </p>
        </AdminCard>
        <AdminCard title="Add stock">
          <form onSubmit={receive} className="space-y-3">
            <label className={adminLabelClass}>
              How many arrived?
              <input
                name="quantity"
                type="number"
                min={1}
                required
                className={`${adminInputClass} mt-1.5`}
              />
            </label>
            <button type="submit" disabled={busy} className={`${adminButtonClass("primary")} w-full`}>
              Add to shelf
            </button>
          </form>
        </AdminCard>
      </div>

      <details className="rounded-2xl border border-navy/8 bg-white px-4 py-3">
        <summary className="cursor-pointer text-sm font-semibold text-navy/80">
          Fix stock count (after a physical count)
        </summary>
        <form onSubmit={correct} className="mt-4 space-y-4 border-t border-navy/8 pt-4">
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
          <button type="submit" disabled={busy} className={adminButtonClass("secondary")}>
            Update stock count
          </button>
        </form>
      </details>
    </div>
  );
}
