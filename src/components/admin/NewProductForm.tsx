"use client";

import {
  AdminNotice,
  adminButtonClass,
  adminInputClass,
  adminLabelClass,
  adminSelectClass,
  adminTextareaClass,
} from "@/components/admin/ui";
import { formatKes, priceWithUnit } from "@/lib/format";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useRef, useState, type ReactNode } from "react";

type Category = {
  id: string;
  name: string;
  isActive: boolean;
  subcategories: { id: string; name: string; isActive: boolean }[];
};

const UNIT_PRESETS = [
  { unit: "Box of 100", stockUnit: "boxes" },
  { unit: "Pack of 10", stockUnit: "packs" },
  { unit: "Pair", stockUnit: "pairs" },
  { unit: "Piece", stockUnit: "pieces" },
  { unit: "Bottle", stockUnit: "bottles" },
  { unit: "Roll", stockUnit: "rolls" },
  { unit: "Tube", stockUnit: "tubes" },
  { unit: "Carton", stockUnit: "cartons" },
  { unit: "Set", stockUnit: "sets" },
  { unit: "Kit", stockUnit: "kits" },
] as const;

const STOCK_UNITS = ["boxes", "packs", "pieces", "pairs", "bottles", "rolls", "tubes", "cartons", "sets", "kits"];

export function NewProductForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [showDescription, setShowDescription] = useState(false);
  const [priceKes, setPriceKes] = useState<number | "">("");
  const [unit, setUnit] = useState("Box of 100");
  const [stockUnit, setStockUnit] = useState("boxes");
  const [openingStock, setOpeningStock] = useState<number | "">(0);
  const [reorderThreshold, setReorderThreshold] = useState<number | "">(5);
  const [publish, setPublish] = useState(false);
  const [askUs, setAskUs] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedCategory = useMemo(
    () => categories.find((item) => item.id === categoryId),
    [categories, categoryId],
  );
  const subcategories = selectedCategory?.subcategories ?? [];
  const selectedSub = subcategories.find((item) => item.id === subcategoryId);

  const canPreview = Boolean(name.trim() && priceKes !== "" && Number(priceKes) >= 0 && unit.trim());
  const canSave =
    Boolean(name.trim() && categoryId && priceKes !== "" && unit.trim()) &&
    !(publish && !photoPreview) &&
    !busy;

  function applyPhoto(file: File | undefined) {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    if (!file) {
      setPhotoPreview(null);
      setPhotoName("");
      return;
    }
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoName(file.name);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSave) {
      if (publish && !photoPreview) {
        setError("Add a product photo before publishing on the website.");
      }
      return;
    }
    setBusy(true);
    setError("");

    const form = new FormData(event.currentTarget);
    form.set("categoryId", categoryId);
    form.set("subcategoryId", subcategoryId);
    form.set("showInShop", publish ? "true" : "false");
    form.set("askForAvailability", askUs ? "true" : "false");
    form.set("shortDescription", shortDescription.trim() || name.trim());
    form.set("unit", unit);
    form.set("stockUnit", stockUnit);

    const response = await fetch("/api/admin/products", {
      method: "POST",
      body: form,
    });
    const data = await response.json();
    setBusy(false);

    if (!response.ok) {
      setError(data.error ?? "Could not save the product.");
      if (data.id) router.push(`/admin/products/${data.id}`);
      return;
    }

    router.push(`/admin/products/${data.id}`);
  }

  if (categories.length === 0) {
    return (
      <AdminNotice tone="warn">
        Add a category first in{" "}
        <Link href="/admin/categories" className="font-semibold text-teal">
          Categories
        </Link>{" "}
        before creating products.
      </AdminNotice>
    );
  }

  const previewCard = (
    <ShopPreview
      name={name}
      summary={shortDescription}
      priceKes={Number(priceKes) || 0}
      unit={unit}
      photoPreview={photoPreview}
      askUs={askUs}
      inStock={Number(openingStock) > 0}
      publish={publish}
      categoryLabel={[selectedCategory?.name, selectedSub?.name].filter(Boolean).join(" · ")}
      ready={canPreview}
    />
  );

  return (
    <form
      onSubmit={onSubmit}
      className="min-w-0 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(14rem,18rem)] lg:items-start lg:gap-6 xl:gap-8"
    >
      <div className="space-y-4">
        <Section n={1} title="Basics" hint="What customers call it">
          <label className={adminLabelClass}>
            Product name <span className="text-coral">*</span>
            <input
              name="name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Examination Gloves"
              className={`${adminInputClass} mt-1.5 text-base font-medium`}
            />
          </label>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className={adminLabelClass}>
              Category <span className="text-coral">*</span>
              <select
                required
                value={categoryId}
                onChange={(event) => {
                  setCategoryId(event.target.value);
                  setSubcategoryId("");
                }}
                className={`${adminSelectClass} mt-1.5`}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                    {category.isActive ? "" : " (hidden)"}
                  </option>
                ))}
              </select>
            </label>

            <label className={adminLabelClass}>
              Subcategory
              <select
                name="subcategoryId"
                value={subcategoryId}
                onChange={(event) => setSubcategoryId(event.target.value)}
                className={`${adminSelectClass} mt-1.5`}
                disabled={subcategories.length === 0}
              >
                {subcategories.length === 0 ? (
                  <option value="">None for this category</option>
                ) : (
                  <>
                    <option value="">None</option>
                    {subcategories.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                        {item.isActive ? "" : " (hidden)"}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </label>
          </div>

          <label className={`${adminLabelClass} mt-4`}>
            Short summary
            <span className="mt-0.5 block text-xs font-normal text-navy/55">
              One line under the name on cards. Optional.
            </span>
            <input
              value={shortDescription}
              onChange={(event) => setShortDescription(event.target.value.slice(0, 200))}
              maxLength={200}
              placeholder="Powder-free disposable examination gloves"
              className={`${adminInputClass} mt-1.5`}
            />
            <span className="mt-1 block text-right text-xs tabular-nums text-navy/40">
              {shortDescription.length}/200
            </span>
          </label>

          {showDescription ? (
            <label className={`${adminLabelClass} mt-3`}>
              Description
              <textarea
                name="description"
                rows={3}
                placeholder="What it is, pack size, who it is for…"
                className={`${adminTextareaClass} mt-1.5`}
              />
            </label>
          ) : (
            <button
              type="button"
              onClick={() => setShowDescription(true)}
              className="mt-3 text-sm font-medium text-teal underline-offset-2 hover:underline"
            >
              + Longer description
            </button>
          )}
        </Section>

        <Section n={2} title="Price & pack" hint="What they pay for">
          <label className={adminLabelClass}>
            Selling price <span className="text-coral">*</span>
            <div className="mt-1.5 flex items-stretch overflow-hidden rounded-xl border border-navy/10 bg-white shadow-sm focus-within:border-teal/40 focus-within:ring-2 focus-within:ring-teal/15">
              <span className="flex items-center bg-sand/50 px-3.5 text-sm font-medium text-navy/60">
                KSh
              </span>
              <input
                name="priceKes"
                type="number"
                min={0}
                required
                value={priceKes}
                onChange={(event) =>
                  setPriceKes(event.target.value === "" ? "" : Math.max(0, Number(event.target.value) || 0))
                }
                placeholder="0"
                className="min-h-11 w-full border-0 bg-transparent px-3.5 text-lg font-semibold tabular-nums text-navy outline-none placeholder:font-normal placeholder:text-navy/35"
              />
            </div>
          </label>

          <div className="mt-5">
            <p className={adminLabelClass}>
              Customer buys <span className="text-coral">*</span>
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {UNIT_PRESETS.map((preset) => {
                const active = unit === preset.unit;
                return (
                  <button
                    key={preset.unit}
                    type="button"
                    onClick={() => {
                      setUnit(preset.unit);
                      setStockUnit(preset.stockUnit);
                    }}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      active
                        ? "bg-navy text-cream shadow-sm"
                        : "border border-navy/10 bg-sand/30 text-navy/80 hover:border-navy/20 hover:bg-white"
                    }`}
                  >
                    {preset.unit}
                  </button>
                );
              })}
            </div>
            <input
              name="unit"
              required
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
              placeholder="Or type a custom pack size…"
              className={`${adminInputClass} mt-2.5`}
            />
          </div>

          {canPreview ? (
            <p className="mt-4 rounded-xl border border-teal/15 bg-teal/[0.06] px-4 py-3 text-sm text-navy/80">
              Shop price:{" "}
              <strong className="font-semibold text-navy">
                {priceWithUnit(Number(priceKes) || 0, unit)}
              </strong>
            </p>
          ) : null}
        </Section>

        <Section n={3} title="Stock" hint="What you have on the shelf">
          <div className="grid gap-4 sm:grid-cols-3">
            <label className={adminLabelClass}>
              Counted as
              <select
                name="stockUnit"
                value={stockUnit}
                onChange={(event) => setStockUnit(event.target.value)}
                className={`${adminSelectClass} mt-1.5`}
              >
                {STOCK_UNITS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className={adminLabelClass}>
              On shelf <span className="text-coral">*</span>
              <input
                name="openingStock"
                type="number"
                min={0}
                required
                value={openingStock}
                onChange={(event) =>
                  setOpeningStock(
                    event.target.value === "" ? "" : Math.max(0, Math.floor(Number(event.target.value) || 0)),
                  )
                }
                className={`${adminInputClass} mt-1.5`}
              />
            </label>
            <label className={adminLabelClass}>
              Alert at
              <input
                name="reorderThreshold"
                type="number"
                min={0}
                value={reorderThreshold}
                onChange={(event) =>
                  setReorderThreshold(
                    event.target.value === "" ? "" : Math.max(0, Math.floor(Number(event.target.value) || 0)),
                  )
                }
                className={`${adminInputClass} mt-1.5`}
              />
            </label>
          </div>
        </Section>

        <Section n={4} title="Photo & website" hint="How it appears in the shop">
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragOver(false);
              const file = event.dataTransfer.files?.[0];
              if (file && file.type.startsWith("image/")) {
                applyPhoto(file);
                if (fileInputRef.current) {
                  const dt = new DataTransfer();
                  dt.items.add(file);
                  fileInputRef.current.files = dt.files;
                }
              }
            }}
          >
            <label
              className={`relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${
                dragOver
                  ? "border-teal bg-teal/10"
                  : photoPreview
                    ? "border-navy/10 bg-sand/20"
                    : "border-navy/15 bg-gradient-to-b from-sand/40 to-white hover:border-teal/35 hover:from-teal/[0.06]"
              }`}
            >
              <input
                ref={fileInputRef}
                name="file"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) => applyPhoto(event.target.files?.[0])}
              />
              {photoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoPreview}
                  alt=""
                  className="mb-3 h-36 w-36 rounded-2xl object-cover shadow-md ring-1 ring-navy/10"
                />
              ) : (
                <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl font-light text-teal shadow-sm ring-1 ring-navy/8">
                  +
                </span>
              )}
              <span className="text-sm font-semibold text-navy">
                {photoPreview ? "Replace photo" : "Add product photo"}
              </span>
              <span className="mt-1 max-w-[16rem] text-xs leading-5 text-navy/55">
                {photoName || "Drop an image here, or click to browse · JPG, PNG, WebP · max 6 MB"}
              </span>
            </label>
          </div>
          {photoPreview ? (
            <button
              type="button"
              className="mt-2 text-sm font-medium text-coral hover:underline"
              onClick={() => {
                applyPhoto(undefined);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            >
              Remove photo
            </button>
          ) : null}

          <p className={`${adminLabelClass} mt-6 mb-2`}>Visibility</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <VisibilityChoice
              active={!publish}
              title="Draft"
              subtitle="Catalogue only — stay off the website"
              onClick={() => setPublish(false)}
            />
            <VisibilityChoice
              active={publish}
              title="Publish"
              subtitle="Live in the shop — photo required"
              onClick={() => setPublish(true)}
            />
          </div>
          {publish && !photoPreview ? (
            <p className="mt-2 text-sm font-medium text-coral">Add a photo before publishing.</p>
          ) : null}

          <label className={`${adminLabelClass} mt-5`}>
            Availability label
            <select
              value={askUs ? "ask" : "auto"}
              onChange={(event) => setAskUs(event.target.value === "ask")}
              className={`${adminSelectClass} mt-1.5`}
            >
              <option value="auto">Automatic — In stock / Out of stock</option>
              <option value="ask">Always show “Ask us”</option>
            </select>
          </label>
        </Section>

        <div className="lg:hidden">{previewCard}</div>

        {error ? <AdminNotice tone="warn">{error}</AdminNotice> : null}

        <div className="admin-sticky-action rounded-2xl border border-navy/10 bg-cream/95 p-3.5 shadow-[0_10px_36px_rgba(22,52,76,0.14)] backdrop-blur sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-navy">
                {publish ? "Ready to go live" : "Saving as a draft"}
              </p>
              <p className="mt-0.5 text-xs text-navy/55">
                {publish
                  ? "Customers will see this product after you save."
                  : "You can add a photo and publish later."}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/admin/products"
                className={`${adminButtonClass("secondary")} flex-1 sm:flex-none`}
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={!canSave}
                className={`${adminButtonClass("primary")} flex-1 sm:min-w-40 sm:flex-none`}
              >
                {busy ? "Saving…" : publish ? "Save & publish" : "Save product"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <aside className="hidden min-w-0 lg:sticky lg:top-6 lg:block lg:self-start">{previewCard}</aside>
    </form>
  );
}

function Section({
  n,
  title,
  hint,
  children,
}: {
  n: number;
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-navy/8 bg-white p-5 shadow-[0_1px_2px_rgba(22,52,76,0.04),0_10px_28px_rgba(22,52,76,0.05)] sm:p-6">
      <div className="mb-5 flex items-start gap-3 border-b border-navy/6 pb-4">
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-semibold text-cream">
          {n}
        </span>
        <div>
          <h2 className="font-semibold tracking-tight text-navy">{title}</h2>
          <p className="mt-0.5 text-sm text-navy/55">{hint}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function VisibilityChoice({
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
      className={`rounded-xl border px-3.5 py-3.5 text-left transition ${
        active
          ? "border-teal/40 bg-teal/[0.07] shadow-sm ring-1 ring-teal/20"
          : "border-navy/10 bg-sand/20 hover:border-navy/20 hover:bg-white"
      }`}
    >
      <span className="flex items-center gap-2">
        <span
          className={`inline-flex h-4 w-4 items-center justify-center rounded-full border-2 ${
            active ? "border-teal" : "border-navy/25"
          }`}
        >
          {active ? <span className="h-2 w-2 rounded-full bg-teal" /> : null}
        </span>
        <span className="text-sm font-semibold text-navy">{title}</span>
      </span>
      <span className="mt-1.5 block pl-6 text-xs leading-5 text-navy/55">{subtitle}</span>
    </button>
  );
}

function ShopPreview({
  name,
  summary,
  priceKes,
  unit,
  photoPreview,
  askUs,
  inStock,
  publish,
  categoryLabel,
  ready,
}: {
  name: string;
  summary: string;
  priceKes: number;
  unit: string;
  photoPreview: string | null;
  askUs: boolean;
  inStock: boolean;
  publish: boolean;
  categoryLabel: string;
  ready: boolean;
}) {
  return (
    <div className="rounded-2xl border border-navy/8 bg-white p-4 shadow-[0_1px_2px_rgba(22,52,76,0.04),0_12px_32px_rgba(22,52,76,0.06)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-navy/45">Shop preview</p>
      <p className="mt-1 text-xs text-navy/50">How it can look on the website</p>

      <div
        className={`mt-4 overflow-hidden rounded-xl border border-navy/8 bg-paper transition ${
          ready ? "opacity-100" : "opacity-60"
        }`}
      >
        <div className="relative aspect-square bg-gradient-to-br from-mist/80 to-sand/50 p-3">
          {photoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoPreview} alt="" className="h-full w-full object-contain" />
          ) : (
            <div className="grid h-full place-items-center">
              <div className="text-center">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-teal">Velora</p>
                <p className="mt-2 text-xs text-navy/40">Photo appears here</p>
              </div>
            </div>
          )}
          {!publish ? (
            <span className="absolute left-2 top-2 rounded-full bg-navy/85 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cream">
              Draft
            </span>
          ) : null}
        </div>
        <div className="space-y-1.5 px-3.5 py-3.5">
          {categoryLabel ? (
            <p className="truncate text-[10px] font-medium uppercase tracking-[0.12em] text-navy/40">
              {categoryLabel}
            </p>
          ) : null}
          <p className="line-clamp-2 text-[0.95rem] font-semibold leading-snug text-navy">
            {name.trim() || "Product name"}
          </p>
          {summary.trim() ? (
            <p className="line-clamp-2 text-xs leading-5 text-navy/60">{summary}</p>
          ) : (
            <p className="text-xs text-navy/35">Short summary…</p>
          )}
          <p className="pt-1 text-base font-bold tabular-nums tracking-tight text-navy">
            {ready ? formatKes(priceKes) : "KSh —"}
          </p>
          <p className="truncate text-xs text-navy/55">{unit || "Pack size"}</p>
          <p className="pt-0.5 text-xs font-semibold text-teal">
            {askUs ? "Ask us" : inStock ? "In stock" : "Out of stock"}
          </p>
        </div>
      </div>
    </div>
  );
}
