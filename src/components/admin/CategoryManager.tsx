"use client";

import {
  AdminBadge,
  AdminCard,
  AdminNotice,
  adminButtonClass,
  adminInputClass,
  adminLabelClass,
  adminSelectClass,
} from "@/components/admin/ui";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

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

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        parentId: form.get("parentId"),
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Could not add that.");
      return;
    }
    event.currentTarget.reset();
    router.refresh();
  }

  async function act(id: string, type: "category" | "subcategory", action: string) {
    setError("");
    const response = await fetch(`/api/admin/categories/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, action }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Could not update that.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="max-w-2xl space-y-4">
      {error ? <AdminNotice tone="warn">{error}</AdminNotice> : null}

      <div className="space-y-3">
        {categories.map((category) => (
          <AdminCard key={category.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-navy">{category.name}</p>
                  {!category.isActive ? <AdminBadge tone="neutral">Hidden</AdminBadge> : null}
                </div>
                <p className="mt-1 text-xs text-navy/50">
                  {category._count.products} product{category._count.products === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={adminButtonClass("ghost")}
                  onClick={() => act(category.id, "category", category.isActive ? "hide" : "show")}
                >
                  {category.isActive ? "Hide" : "Show"}
                </button>
                {category._count.products === 0 && category.subcategories.length === 0 ? (
                  <button
                    type="button"
                    className={adminButtonClass("danger")}
                    onClick={() => act(category.id, "category", "delete")}
                  >
                    Delete
                  </button>
                ) : null}
              </div>
            </div>

            {category.subcategories.length > 0 ? (
              <ul className="mt-4 divide-y divide-navy/6 rounded-xl border border-navy/6 bg-sand/20">
                {category.subcategories.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
                  >
                    <span className="flex flex-wrap items-center gap-2 text-navy/85">
                      {item.name}
                      {!item.isActive ? <AdminBadge tone="neutral">Hidden</AdminBadge> : null}
                      <span className="text-navy/45">
                        {item._count.products} product{item._count.products === 1 ? "" : "s"}
                      </span>
                    </span>
                    <span className="flex gap-2">
                      <button
                        type="button"
                        className={adminButtonClass("ghost")}
                        onClick={() =>
                          act(item.id, "subcategory", item.isActive ? "hide" : "show")
                        }
                      >
                        {item.isActive ? "Hide" : "Show"}
                      </button>
                      {item._count.products === 0 ? (
                        <button
                          type="button"
                          className={adminButtonClass("danger")}
                          onClick={() => act(item.id, "subcategory", "delete")}
                        >
                          Delete
                        </button>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </AdminCard>
        ))}
      </div>

      <AdminCard title="Add category or subcategory">
        <form onSubmit={add} className="space-y-4">
          <label className={adminLabelClass}>
            Name
            <input name="name" required className={`${adminInputClass} mt-1.5`} />
          </label>
          <label className={adminLabelClass}>
            Under
            <select name="parentId" className={`${adminSelectClass} mt-1.5`}>
              <option value="">Top-level category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className={adminButtonClass("primary")}>
            Add
          </button>
        </form>
      </AdminCard>
    </div>
  );
}
