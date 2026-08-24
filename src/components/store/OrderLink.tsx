"use client";

import { readOrder } from "@/lib/order-storage";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function OrderLink() {
  const [count, setCount] = useState(0);
  const [bouncing, setBouncing] = useState(false);
  const prevCount = useRef(0);

  useEffect(() => {
    const refresh = () => {
      const next = readOrder().reduce((sum, item) => sum + item.quantity, 0);
      if (next > prevCount.current) {
        setBouncing(false);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setBouncing(true));
        });
      }
      prevCount.current = next;
      setCount(next);
    };
    refresh();
    window.addEventListener("velora-order-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("velora-order-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const label = count ? `Order (${count})` : "Your order";

  return (
    <Link
      href="/your-order"
      className={`inline-flex max-w-[8.5rem] min-h-10 items-center justify-center truncate rounded-xl bg-navy px-2.5 text-xs font-medium text-cream transition sm:max-w-none sm:min-h-11 sm:px-5 sm:text-sm ${bouncing ? "badge-bounce" : ""}`}
      title={count ? `Your order (${count} items)` : "Your order"}
      onAnimationEnd={() => setBouncing(false)}
    >
      <span className="truncate">{label}</span>
    </Link>
  );
}
