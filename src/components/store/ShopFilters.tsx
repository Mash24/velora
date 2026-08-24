"use client";

import { useMemo, useState } from "react";

type Category = {
  id: string;
  name: string;
  slug: string;
  subcategories: { id: string; name: string; slug: string }[];
};

type Band = { value: string; label: string };

type Query = {
  category?: string;
  subcategory?: string;
  q?: string;
  availability?: string;
  price?: string;
  sort?: string;
};

const fieldClass =
  "mt-1.5 min-h-11 w-full min-w-0 rounded-xl border border-navy/15 bg-white px-3 py-2 text-base text-navy sm:rounded-full sm:px-4";

function FilterFields({
  idPrefix = "",
  categories,
  subcategories,
  bands,
  category,
  subcategory,
  availability,
  price,
  sort,
}: {
  idPrefix?: string;
  categories: Category[];
  subcategories: { id: string; name: string; slug: string }[];
  bands: Band[];
  category?: string;
  subcategory?: string;
  availability?: string;
  price?: string;
  sort?: string;
}) {
  return (
    <>
      <label className="block min-w-0 text-sm font-medium text-navy">
        Category
        <select
          id={`${idPrefix}category`}
          name="category"
          defaultValue={category ?? ""}
          className={fieldClass}
        >
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block min-w-0 text-sm font-medium text-navy">
        Subcategory
        <select
          id={`${idPrefix}subcategory`}
          name="subcategory"
          defaultValue={subcategory ?? ""}
          disabled={!category}
          className={`${fieldClass} disabled:opacity-50`}
        >
          <option value="">All subcategories</option>
          {subcategories.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
        {category && subcategories.length === 0 ? (
          <span className="mt-1 block text-xs text-navy/55">No subcategories in this group yet.</span>
        ) : null}
      </label>
      <label className="block min-w-0 text-sm font-medium text-navy">
        Availability
        <select name="availability" defaultValue={availability ?? ""} className={fieldClass}>
          <option value="">All</option>
          <option value="in">In stock</option>
          <option value="out">Out of stock</option>
        </select>
      </label>
      {bands.length > 0 ? (
        <label className="block min-w-0 text-sm font-medium text-navy">
          Price
          <select name="price" defaultValue={price ?? ""} className={fieldClass}>
            <option value="">All prices</option>
            {bands.map((band) => (
              <option key={band.value} value={band.value}>
                {band.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <label className="block min-w-0 text-sm font-medium text-navy">
        Sort
        <select name="sort" defaultValue={sort ?? ""} className={fieldClass}>
          <option value="">Relevance</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="newest">Newest</option>
        </select>
      </label>
    </>
  );
}

export function ShopFilters({
  categories,
  subcategories,
  bands,
  query,
  productCount,
}: {
  categories: Category[];
  subcategories: { id: string; name: string; slug: string }[];
  bands: Band[];
  query: Query;
  productCount: number;
}) {
  const [open, setOpen] = useState(false);
  const { category, subcategory, q, availability, price, sort } = query;

  const activeFilters = useMemo(() => {
    let count = 0;
    if (category) count += 1;
    if (subcategory) count += 1;
    if (availability) count += 1;
    if (price) count += 1;
    if (sort) count += 1;
    return count;
  }, [category, subcategory, availability, price, sort]);

  const filterProps = {
    categories,
    subcategories,
    bands,
    category,
    subcategory,
    availability,
    price,
    sort,
  };

  return (
    <>
      <form method="get" className="mt-6 min-w-0">
        <label id="search" className="scroll-mt-24 block min-w-0 text-sm font-medium text-navy">
          Search products
          <input
            name="q"
            defaultValue={q}
            placeholder="Search gloves, masks..."
            className={fieldClass}
          />
        </label>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-navy/70">
            {productCount} product{productCount === 1 ? "" : "s"}
          </p>
          <button
            type="button"
            className="inline-flex min-h-11 items-center rounded-full border border-navy/15 bg-white px-4 text-sm font-medium text-navy lg:hidden"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            Filters{activeFilters > 0 ? ` (${activeFilters})` : ""}
          </button>
        </div>

        <div className="mt-4 hidden min-w-0 gap-3 lg:grid lg:grid-cols-3">
          <FilterFields {...filterProps} />
          <div className="flex items-end lg:col-span-3">
            <button
              type="submit"
              className="min-h-11 w-full rounded-full bg-navy px-5 py-2 text-sm font-medium text-cream sm:w-auto"
            >
              Apply filters
            </button>
            {(category || subcategory || availability || price || sort || q) && (
              <a href="/shop" className="ml-3 min-h-11 py-3 text-sm font-medium text-teal">
                Clear
              </a>
            )}
          </div>
        </div>
      </form>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-navy/40 lg:hidden"
            aria-label="Close filters"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Shop filters"
            className="fixed inset-x-0 bottom-0 z-50 flex max-h-[min(85dvh,640px)] flex-col rounded-t-2xl border-t border-navy/10 bg-white shadow-[0_-8px_32px_rgba(22,52,76,0.12)] lg:hidden"
          >
            <div className="flex items-center justify-between border-b border-navy/8 px-4 py-3">
              <h2 className="font-semibold text-navy">Filters</h2>
              <button
                type="button"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-sm font-medium text-navy"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
            <form
              method="get"
              className="flex min-h-0 flex-1 flex-col"
              onSubmit={() => setOpen(false)}
            >
              <input type="hidden" name="q" value={q ?? ""} />
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
                <FilterFields idPrefix="mobile-" {...filterProps} />
              </div>
              <div className="safe-bottom flex shrink-0 gap-3 border-t border-navy/8 px-4 py-4">
                <button
                  type="submit"
                  className="min-h-11 flex-1 rounded-full bg-navy text-sm font-medium text-cream"
                >
                  Apply filters
                </button>
                <a
                  href="/shop"
                  className="inline-flex min-h-11 items-center px-3 text-sm font-medium text-teal"
                >
                  Clear
                </a>
              </div>
            </form>
          </div>
        </>
      ) : null}
    </>
  );
}
