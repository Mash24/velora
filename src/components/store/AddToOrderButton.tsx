"use client";

import { MAX_ORDER_LINE_QTY } from "@/lib/constants";
import { addToOrder } from "@/lib/order-storage";
import Link from "next/link";
import { useState } from "react";

type Props = {
  productId: string;
  name: string;
  unit: string;
  priceKes: number;
  inStock: boolean;
  askUs: boolean;
  imageUrl?: string;
  compact?: boolean;
};

export function AddToOrderButton({
  productId,
  name,
  unit,
  priceKes,
  inStock,
  askUs,
  imageUrl,
  compact = false,
}: Props) {
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  function add(qty = quantity) {
    addToOrder({ productId, name, unit, priceKes, imageUrl }, qty);
    setAdded(true);
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => add(1)}
        className={`min-h-9 w-full rounded-lg px-2 text-xs font-semibold transition active:scale-[0.98] sm:min-h-11 sm:rounded-xl sm:px-4 sm:text-sm ${
          added
            ? "bg-teal/10 text-teal ring-1 ring-teal/30"
            : "bg-coral text-white shadow-[0_3px_10px_rgba(196,92,38,0.3)] hover:bg-coral/90"
        }`}
      >
        {added ? "Added" : (
          <>
            <span className="sm:hidden">Add</span>
            <span className="hidden sm:inline">Add to order</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      {!inStock && !askUs ? (
        <p className="text-sm text-navy/70">This item is currently out of stock.</p>
      ) : null}
      <div className="flex items-center gap-3">
        <span className="text-sm">Quantity</span>
        <button
          type="button"
          aria-label="Reduce quantity"
          className="min-h-11 min-w-11 rounded-full border border-navy/15"
          onClick={() => setQuantity((value) => Math.max(1, value - 1))}
        >
          −
        </button>
        <span className="min-w-6 text-center">{quantity}</span>
        <button
          type="button"
          aria-label="Increase quantity"
          className="min-h-11 min-w-11 rounded-full border border-navy/15"
          onClick={() => setQuantity((value) => Math.min(MAX_ORDER_LINE_QTY, value + 1))}
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={() => add()}
        className={`min-h-11 rounded-full px-5 py-3 text-sm font-semibold transition active:scale-[0.98] ${
          added
            ? "bg-teal/10 text-teal ring-1 ring-teal/30"
            : "bg-coral text-white shadow-[0_3px_12px_rgba(196,92,38,0.3)] hover:bg-coral/90"
        }`}
      >
        {added ? "✓ Added to order" : "Add to your order"}
      </button>
      {added ? (
        <Link href="/your-order" className="block text-sm text-teal">
          View your order
        </Link>
      ) : null}
    </div>
  );
}
