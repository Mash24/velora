export function categoryPath(categoryName: string, subcategoryName?: string | null) {
  if (subcategoryName) return `${categoryName} → ${subcategoryName}`;
  return categoryName;
}
