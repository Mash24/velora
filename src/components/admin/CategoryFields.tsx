"use client";

import { adminInputClass, adminLabelClass, adminSelectClass } from "@/components/admin/ui";
import { useState } from "react";

type Category = {
  id: string;
  name: string;
  isActive: boolean;
  subcategories: { id: string; name: string; isActive: boolean }[];
};

export function CategoryFields({
  categories,
  categoryId,
  subcategoryId,
  onCategoryChange,
  onSubcategoryChange,
}: {
  categories: Category[];
  categoryId: string;
  subcategoryId: string;
  onCategoryChange: (id: string) => void;
  onSubcategoryChange: (id: string) => void;
}) {
  const [showNewCategory, setShowNewCategory] = useState(categories.length === 0);
  const [showNewSubcategory, setShowNewSubcategory] = useState(false);
  const children = categories.find((item) => item.id === categoryId)?.subcategories ?? [];

  return (
    <div className="space-y-4">
      <label className={adminLabelClass}>
        Category
        <select
          value={categoryId}
          onChange={(event) => {
            onCategoryChange(event.target.value);
            onSubcategoryChange("");
            setShowNewSubcategory(false);
          }}
          className={`${adminSelectClass} mt-1.5`}
        >
          {categories.length === 0 ? <option value="">Choose or add a category</option> : null}
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
              {category.isActive ? "" : " (hidden)"}
            </option>
          ))}
        </select>
      </label>

      {showNewCategory ? (
        <label className={adminLabelClass}>
          New category name
          <input
            name="categoryName"
            placeholder="e.g. Wound Care & Dressings"
            className={`${adminInputClass} mt-1.5`}
          />
        </label>
      ) : (
        <button
          type="button"
          onClick={() => setShowNewCategory(true)}
          className="text-sm font-semibold text-teal"
        >
          + Add a new category
        </button>
      )}

      <label className={adminLabelClass}>
        Subcategory <span className="font-normal text-navy/50">(optional)</span>
        <select
          name="subcategoryId"
          value={subcategoryId}
          onChange={(event) => onSubcategoryChange(event.target.value)}
          className={`${adminSelectClass} mt-1.5`}
        >
          <option value="">None</option>
          {children.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
              {item.isActive ? "" : " (hidden)"}
            </option>
          ))}
        </select>
      </label>

      {showNewSubcategory ? (
        <label className={adminLabelClass}>
          New subcategory name
          <input
            name="subcategoryName"
            placeholder="e.g. Examination Gloves"
            className={`${adminInputClass} mt-1.5`}
          />
        </label>
      ) : (
        <button
          type="button"
          onClick={() => setShowNewSubcategory(true)}
          className="text-sm font-semibold text-teal"
        >
          + Add a new subcategory
        </button>
      )}
    </div>
  );
}
