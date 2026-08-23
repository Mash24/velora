"use client";

import { adminInputClass, adminLabelClass, adminSelectClass } from "@/components/admin/ui";

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
  const children = categories.find((item) => item.id === categoryId)?.subcategories ?? [];

  return (
    <>
      <label className={adminLabelClass}>
        Category
        <select
          value={categoryId}
          onChange={(event) => {
            onCategoryChange(event.target.value);
            onSubcategoryChange("");
          }}
          className={`${adminSelectClass} mt-1.5`}
        >
          {categories.length === 0 ? (
            <option value="">No categories yet — type one below</option>
          ) : null}
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
              {category.isActive ? "" : " (hidden)"}
            </option>
          ))}
        </select>
      </label>
      <label className={adminLabelClass}>
        Or type a new category
        <input
          name="categoryName"
          placeholder="e.g. Wound Care & Dressings"
          className={`${adminInputClass} mt-1.5`}
        />
      </label>
      <label className={adminLabelClass}>
        Subcategory
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
      <label className={adminLabelClass}>
        Or type a new subcategory
        <input
          name="subcategoryName"
          placeholder="e.g. Examination Gloves"
          className={`${adminInputClass} mt-1.5`}
        />
      </label>
    </>
  );
}
