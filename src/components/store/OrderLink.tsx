"use client";

import { readOrder } from "@/lib/order-storage";
import Link from "next/link";
import { useEffect, useState } from "react";

export function OrderLink() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const refresh = () =>
      setCount(readOrder().reduce((sum, item) => sum + item.quantity, 0));
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
      className="inline-flex max-w-[8.5rem] min-h-10 items-center justify-center truncate rounded-xl bg-navy px-2.5 text-xs font-medium text-cream sm:max-w-none sm:min-h-11 sm:px-5 sm:text-sm"
      title={count ? `Your order (${count} items)` : "Your order"}
    >
      <span className="truncate">{label}</span>
    </Link>
  );
}
