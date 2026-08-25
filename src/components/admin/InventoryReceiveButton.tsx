"use client";

import { adminButtonClass, adminInputClass } from "@/components/admin/ui";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function InventoryReceiveButton({
  productId,
  stockUnit,
  compact = false,
}: {
  productId: string;
  stockUnit: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState<number | "">("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      setError("Enter how many you received.");
      return;
    }
    setBusy(true);
    setError("");
    const response = await fetch(`/api/admin/products/${productId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "receive", quantity: qty }),
    });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) {
      setError(data.error ?? "Could not add stock.");
      return;
    }
    setQuantity("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          compact
            ? "text-sm font-semibold text-teal hover:underline"
            : `${adminButtonClass("primary")} w-full`
        }
      >
        Receive stock
      </button>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className={`w-full min-w-0 max-w-full space-y-2 rounded-xl border border-navy/10 bg-sand/30 p-3 ${compact ? "sm:min-w-[11rem]" : ""}`}
    >
      <label className="block text-xs font-medium text-navy/70">
        How many {stockUnit}?
        <input
          type="number"
          min={1}
          autoFocus
          value={quantity}
          onChange={(event) =>
            setQuantity(event.target.value === "" ? "" : Math.max(1, Math.floor(Number(event.target.value) || 1)))
          }
          className={`${adminInputClass} mt-1`}
          placeholder="e.g. 20"
        />
      </label>
      {error ? <p className="text-xs font-medium text-coral">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={busy} className={adminButtonClass("primary")}>
          {busy ? "Saving…" : "Add to shelf"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setOpen(false);
            setError("");
            setQuantity("");
          }}
          className={adminButtonClass("secondary")}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
