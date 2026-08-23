export function formatKes(amount: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function priceWithUnit(priceKes: number, unit: string) {
  return `${formatKes(priceKes)} / ${unit}`;
}

export function nextSku(count: number) {
  return `VMS-${String(count + 1).padStart(3, "0")}`;
}
