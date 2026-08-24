"use client";

import { formatKes } from "@/lib/format";
import { readOrder } from "@/lib/order-storage";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function OrderLink() {
  const [count, setCount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [bouncing, setBouncing] = useState(false);
  const prevCount = useRef(0);

  useEffect(() => {
    const refresh = () => {
      const items = readOrder();
      const next = items.reduce((sum, item) => sum + item.quantity, 0);
      const total = items.reduce((sum, item) => sum + item.priceKes * item.quantity, 0);
      if (next > prevCount.current) {
        setBouncing(false);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setBouncing(true));
        });
      }
      prevCount.current = next;
      setCount(next);
      setSubtotal(total);
    };
    refresh();
    window.addEventListener("velora-order-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("velora-order-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return (
    <Link
      href="/your-order"
      className={`relative inline-flex min-h-10 items-center gap-2 rounded-xl bg-navy px-3 text-cream transition hover:bg-navy/90 sm:min-h-11 sm:px-4 ${bouncing ? "badge-bounce" : ""}`}
      title={count ? `Your order · ${count} items · ${formatKes(subtotal)}` : "Your order"}
      onAnimationEnd={() => setBouncing(false)}
    >
      <span className="relative">
        <ShoppingBag className="h-4 w-4" aria-hidden />
        {count > 0 ? (
          <span className="absolute -top-2 -right-2 grid h-4 min-w-4 place-items-center rounded-full bg-coral px-1 text-[10px] font-bold text-white">
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </span>
      <span className="hidden text-sm font-medium sm:inline">
        {count ? formatKes(subtotal) : "Order"}
      </span>
      <span className="sr-only">
        {count ? `Your order, ${count} items, ${formatKes(subtotal)}` : "Your order"}
      </span>
    </Link>
  );
}
