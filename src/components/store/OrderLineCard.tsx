"use client";

import { MAX_ORDER_LINE_QTY } from "@/lib/constants";
import { formatKes } from "@/lib/format";
import { removeOrderLine, setOrderQuantity, type OrderLine } from "@/lib/order-storage";

type Props = {
  item: OrderLine;
  onChange: () => void;
};

export function OrderLineCard({ item, onChange }: Props) {
  function changeQuantity(next: number) {
    setOrderQuantity(item.productId, next);
    onChange();
  }

  function remove() {
    removeOrderLine(item.productId);
    onChange();
  }

  const lineTotal = item.priceKes * item.quantity;

  return (
    <li className="rounded-2xl border border-navy/10 bg-white p-4">
      <div className="flex gap-4">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-mist">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center text-xs uppercase tracking-[0.15em] text-teal">
              Velora
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 break-anywhere font-medium text-navy">{item.name}</p>
          <p className="mt-0.5 text-sm text-navy/60">
            {item.unit} · {formatKes(item.priceKes)} each
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={`Reduce quantity of ${item.name}`}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-navy/15 text-lg"
                onClick={() => changeQuantity(item.quantity - 1)}
              >
                −
              </button>
              <span className="min-w-8 text-center font-medium">{item.quantity}</span>
              <button
                type="button"
                aria-label={`Increase quantity of ${item.name}`}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-navy/15 text-lg"
                onClick={() => changeQuantity(Math.min(MAX_ORDER_LINE_QTY, item.quantity + 1))}
              >
                +
              </button>
            </div>
            <p className="text-sm font-medium text-navy">{formatKes(lineTotal)}</p>
          </div>
          <button
            type="button"
            onClick={remove}
            className="mt-2 text-sm text-navy/50 underline-offset-2 hover:text-coral hover:underline"
          >
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
