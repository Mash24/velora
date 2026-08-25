"use client";

import {
  AdminBadge,
  AdminEmpty,
  AdminNotice,
  adminButtonClass,
  adminInputClass,
  adminLabelClass,
  adminSelectClass,
} from "@/components/admin/ui";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState, type ReactNode } from "react";

type Category = {
  id: string;
  name: string;
  isActive: boolean;
  _count: { products: number };
  subcategories: {
    id: string;
    name: string;
    isActive: boolean;
    _count: { products: number };
  }[];
};

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"all" | "visible" | "hidden">("all");
  const [mode, setMode] = useState<"category" | "subcategory">("category");
  const [parentId, setParentId] = useState(categories[0]?.id ?? "");
  const [name, setName] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(categories.map((c) => [c.id, true])),
  );
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    type: "category" | "subcategory";
    label: string;
  } | null>(null);

  const hiddenCount = categories.filter((c) => !c.isActive).length;
  const visibleCount = categories.length - hiddenCount;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return categories
      .filter((category) => {
        if (view === "visible" && !category.isActive) return false;
        if (view === "hidden" && category.isActive) return false;
        if (!q) return true;
        if (category.name.toLowerCase().includes(q)) return true;
        return category.subcategories.some((sub) => sub.name.toLowerCase().includes(q));
      })
      .map((category) => {
        if (!q) return category;
        const nameHit = category.name.toLowerCase().includes(q);
        return {
          ...category,
          subcategories: nameHit
            ? category.subcategories
            : category.subcategories.filter((sub) => sub.name.toLowerCase().includes(q)),
        };
      });
  }, [categories, query, view]);

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter a name.");
      return;
    }
    if (mode === "subcategory" && !parentId) {
      setError("Choose which category this sits under.");
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    const response = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: trimmed,
        parentId: mode === "subcategory" ? parentId : "",
      }),
    });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) {
      setError(data.error ?? "Could not add that.");
      return;
    }
    setName("");
    setMessage(mode === "subcategory" ? "Subcategory added." : "Category added.");
    if (mode === "subcategory" && parentId) {
      setExpanded((prev) => ({ ...prev, [parentId]: true }));
    }
    router.refresh();
  }

  async function act(id: string, type: "category" | "subcategory", action: string) {
    setBusy(true);
    setError("");
    setMessage("");
    setPendingDelete(null);
    const response = await fetch(`/api/admin/categories/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, action }),
    });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) {
      setError(data.error ?? "Could not update that.");
      return;
    }
    if (action === "delete") setMessage("Removed.");
    if (action === "hide") setMessage("Hidden from the shop filters.");
    if (action === "show") setMessage("Visible again.");
    router.refresh();
  }

  function startAddSub(categoryId: string) {
    setMode("subcategory");
    setParentId(categoryId);
    setExpanded((prev) => ({ ...prev, [categoryId]: true }));
    document.getElementById("category-add")?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => document.getElementById("category-name")?.focus(), 200);
  }

  return (
    <div className="mx-auto min-w-0 max-w-2xl space-y-5">
      <section
        id="category-add"
        className="rounded-2xl border border-navy/8 bg-white p-5 shadow-[0_1px_2px_rgba(22,52,76,0.04),0_10px_28px_rgba(22,52,76,0.05)] sm:p-6"
      >
        <h2 className="font-semibold tracking-tight text-navy">Add to the catalogue</h2>
        <p className="mt-1 text-sm text-navy/55">
          Categories group the shop. Subcategories sit under a category.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <TypeChoice
            active={mode === "category"}
            title="Category"
            subtitle="Top-level group"
            onClick={() => setMode("category")}
          />
          <TypeChoice
            active={mode === "subcategory"}
            title="Subcategory"
            subtitle="Under a category"
            onClick={() => setMode("subcategory")}
          />
        </div>

        <form onSubmit={add} className="mt-4 space-y-4">
          <label className={adminLabelClass}>
            Name
            <input
              id="category-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              placeholder={mode === "category" ? "e.g. Wound Care & Dressings" : "e.g. Examination Gloves"}
              className={`${adminInputClass} mt-1.5`}
            />
          </label>
          {mode === "subcategory" ? (
            <label className={adminLabelClass}>
              Under category
              <select
                value={parentId}
                onChange={(event) => setParentId(event.target.value)}
                className={`${adminSelectClass} mt-1.5`}
                required
              >
                {categories.length === 0 ? <option value="">No categories yet</option> : null}
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                    {category.isActive ? "" : " (hidden)"}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <button type="submit" disabled={busy} className={adminButtonClass("primary")}>
            {busy ? "Saving…" : mode === "subcategory" ? "Add subcategory" : "Add category"}
          </button>
        </form>
      </section>

      {error ? <AdminNotice tone="warn">{error}</AdminNotice> : null}
      {message ? <AdminNotice tone="success">{message}</AdminNotice> : null}

      {pendingDelete ? (
        <div className="rounded-xl border border-coral/30 bg-coral/5 p-4">
          <p className="font-semibold text-navy">Delete “{pendingDelete.label}”?</p>
          <p className="mt-1 text-sm text-navy/70">This cannot be undone.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => act(pendingDelete.id, pendingDelete.type, "delete")}
              className={`${adminButtonClass("danger")} border border-coral/30 bg-white`}
            >
              Yes, delete
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setPendingDelete(null)}
              className={adminButtonClass("secondary")}
            >
              Keep it
            </button>
          </div>
        </div>
      ) : null}

      <div className="admin-filter-row">
        <FilterChip active={view === "all"} onClick={() => setView("all")}>
          All ({categories.length})
        </FilterChip>
        <FilterChip active={view === "visible"} onClick={() => setView("visible")}>
          Visible ({visibleCount})
        </FilterChip>
        <FilterChip active={view === "hidden"} onClick={() => setView("hidden")}>
          Hidden ({hiddenCount})
        </FilterChip>
      </div>

      <div className="rounded-2xl border border-navy/8 bg-white p-4 shadow-[0_1px_2px_rgba(22,52,76,0.04),0_10px_28px_rgba(22,52,76,0.05)] sm:p-5">
        <label className="sr-only" htmlFor="category-search">
          Search categories
        </label>
        <input
          id="category-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search categories or subcategories…"
          className={adminInputClass}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-navy/8 bg-white py-2">
          <AdminEmpty>
            {categories.length === 0
              ? "No categories yet — add your first group above."
              : "Nothing matches that view."}
          </AdminEmpty>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((category) => {
            const open = expanded[category.id] ?? true;
            const subCount = category.subcategories.length;
            return (
              <li
                key={category.id}
                className={`overflow-hidden rounded-2xl border bg-white shadow-[0_1px_2px_rgba(22,52,76,0.04),0_8px_24px_rgba(22,52,76,0.04)] ${
                  category.isActive ? "border-navy/8" : "border-navy/10 bg-sand/20"
                }`}
              >
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() =>
                      setExpanded((prev) => ({ ...prev, [category.id]: !open }))
                    }
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-navy/35" aria-hidden>
                        {open ? "▾" : "▸"}
                      </span>
                      <span className="font-semibold text-navy">{category.name}</span>
                      {!category.isActive ? <AdminBadge tone="sand">Hidden</AdminBadge> : null}
                    </div>
                    <p className="mt-1 pl-5 text-xs text-navy/50">
                      {category._count.products} product{category._count.products === 1 ? "" : "s"}
                      {subCount > 0
                        ? ` · ${subCount} subcategor${subCount === 1 ? "y" : "ies"}`
                        : ""}
                    </p>
                  </button>
                  <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => startAddSub(category.id)}
                      className={`${adminButtonClass("secondary")} w-full sm:w-auto`}
                    >
                      + Subcategory
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        act(category.id, "category", category.isActive ? "hide" : "show")
                      }
                      className={`${adminButtonClass("ghost")} w-full sm:w-auto`}
                    >
                      {category.isActive ? "Hide" : "Show"}
                    </button>
                    {category._count.products === 0 && category.subcategories.length === 0 ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          setPendingDelete({
                            id: category.id,
                            type: "category",
                            label: category.name,
                          })
                        }
                        className={`${adminButtonClass("danger")} w-full sm:w-auto`}
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                </div>

                {open ? (
                  <div className="border-t border-navy/6 bg-sand/15 px-4 py-3 sm:px-5">
                    {category.subcategories.length === 0 ? (
                      <p className="text-sm text-navy/50">
                        No subcategories yet.{" "}
                        <button
                          type="button"
                          onClick={() => startAddSub(category.id)}
                          className="font-medium text-teal hover:underline"
                        >
                          Add one
                        </button>
                      </p>
                    ) : (
                      <ul className="divide-y divide-navy/8 overflow-hidden rounded-xl border border-navy/8 bg-white">
                        {category.subcategories.map((item) => (
                          <li
                            key={item.id}
                            className="flex flex-col gap-2 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium text-navy">{item.name}</span>
                                {!item.isActive ? (
                                  <AdminBadge tone="sand">Hidden</AdminBadge>
                                ) : null}
                              </div>
                              <p className="mt-0.5 text-xs text-navy/50">
                                {item._count.products} product
                                {item._count.products === 1 ? "" : "s"}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  act(item.id, "subcategory", item.isActive ? "hide" : "show")
                                }
                                className={adminButtonClass("ghost")}
                              >
                                {item.isActive ? "Hide" : "Show"}
                              </button>
                              {item._count.products === 0 ? (
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() =>
                                    setPendingDelete({
                                      id: item.id,
                                      type: "subcategory",
                                      label: item.name,
                                    })
                                  }
                                  className={adminButtonClass("danger")}
                                >
                                  Delete
                                </button>
                              ) : null}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function TypeChoice({
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
          ? "border-teal/40 bg-teal/[0.07] shadow-sm ring-1 ring-teal/15"
          : "border-navy/10 bg-sand/20 hover:border-navy/20 hover:bg-white"
      }`}
    >
      <span className="block text-sm font-semibold text-navy">{title}</span>
      <span className="mt-0.5 block text-xs text-navy/55">{subtitle}</span>
    </button>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-9 shrink-0 items-center rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition ${
        active
          ? "bg-navy text-cream shadow-sm"
          : "border border-navy/12 bg-white text-navy hover:border-navy/20"
      }`}
    >
      {children}
    </button>
  );
}
