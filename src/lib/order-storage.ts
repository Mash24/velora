import { MAX_ORDER_LINE_QTY } from "./constants";

export const ORDER_STORAGE_KEY = "velora-order";
export const SOURCE_STORAGE_KEY = "velora-source";

export type OrderLine = {
  productId: string;
  name: string;
  unit: string;
  priceKes: number;
  quantity: number;
  imageUrl?: string;
};

export function readOrder(): OrderLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ORDER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as OrderLine[]) : [];
  } catch {
    return [];
  }
}

export function writeOrder(items: OrderLine[]) {
  localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("velora-order-changed"));
}

function clampQty(quantity: number) {
  return Math.min(MAX_ORDER_LINE_QTY, Math.max(0, Math.floor(quantity) || 0));
}

export function addToOrder(line: Omit<OrderLine, "quantity">, quantity = 1) {
  const items = readOrder();
  const existing = items.find((item) => item.productId === line.productId);
  const add = Math.max(1, clampQty(quantity));
  if (existing) existing.quantity = clampQty(existing.quantity + add);
  else items.push({ ...line, quantity: add });
  writeOrder(items);
}

export function setOrderQuantity(productId: string, quantity: number) {
  const nextQty = clampQty(quantity);
  if (nextQty <= 0) {
    writeOrder(readOrder().filter((item) => item.productId !== productId));
    return;
  }
  writeOrder(
    readOrder().map((item) => (item.productId === productId ? { ...item, quantity: nextQty } : item)),
  );
}

export function removeOrderLine(productId: string) {
  writeOrder(readOrder().filter((item) => item.productId !== productId));
}

export function clearOrder() {
  writeOrder([]);
}
