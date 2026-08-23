"use client";

import { AdminCard, adminButtonClass, adminInputClass, adminSelectClass } from "@/components/admin/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function OrderActions({
  orderId,
  status,
  paymentStatus,
  deliveryStatus,
  totalKes,
}: {
  orderId: string;
  status: string;
  paymentStatus: string;
  deliveryStatus: string;
  totalKes: number;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [mpesaCode, setMpesaCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("MPESA");
  const [riderName, setRiderName] = useState("");
  const [failureReason, setFailureReason] = useState("");

  const isEnquiry = status === "ENQUIRY";
  const isConfirmed = status === "CONFIRMED";
  const isProcessing = status === "PROCESSING";
  const canOperate = isConfirmed || isProcessing;
  const unpaid = paymentStatus !== "PAID";
  const delivered = deliveryStatus === "DELIVERED";
  const outForDelivery = deliveryStatus === "OUT_FOR_DELIVERY";
  const deliveryFailed = deliveryStatus === "FAILED";

  async function run(action: string, extra?: Record<string, string>) {
    setError("");
    if (action === "cancel") {
      const label = isEnquiry
        ? "Cancel this order request?"
        : "Cancel this order? Stock that was taken will be put back.";
      if (!window.confirm(label)) return;
    }
    if (action === "paid" && isEnquiry) {
      const ok = window.confirm(
        "This order is not confirmed yet — stock has not been taken. Record payment anyway?",
      );
      if (!ok) return;
    }
    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Could not update the order.");
      return;
    }
    router.refresh();
  }

  if (status === "COMPLETED" || status === "CANCELLED") {
    return null;
  }

  return (
    <div className="mt-6 space-y-4">
      {isConfirmed ? (
        <button type="button" onClick={() => run("processing")} className={`${adminButtonClass("primary")} w-full`}>
          Mark as processing
        </button>
      ) : null}

      {canOperate && unpaid ? (
        <AdminCard title="Payment">
          <p className="mb-4 text-sm text-navy/65">Full order total: KSh {totalKes.toLocaleString()}</p>
          <label className="block text-sm">
            Method
            <select
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
              className={`${adminSelectClass} mt-1.5`}
            >
              <option value="MPESA">M-Pesa</option>
              <option value="CASH">Cash</option>
              <option value="PAY_ON_DELIVERY">Pay on delivery</option>
              <option value="OTHER">Other</option>
            </select>
          </label>
          {paymentMethod === "MPESA" ? (
            <label className="mt-3 block text-sm">
              M-Pesa code (if any)
              <input
                value={mpesaCode}
                onChange={(event) => setMpesaCode(event.target.value)}
                className={`${adminInputClass} mt-1.5`}
              />
            </label>
          ) : null}
          <button
            type="button"
            onClick={() => run("paid", { mpesaCode, paymentMethod })}
            className={`${adminButtonClass("secondary")} mt-4 w-full`}
          >
            Mark as paid
          </button>
        </AdminCard>
      ) : paymentStatus === "PAID" && canOperate ? (
        <AdminCard>
          <p className="text-sm text-navy/75">Payment recorded.</p>
        </AdminCard>
      ) : null}

      {canOperate && !delivered ? (
        <AdminCard title="Delivery">
          {deliveryFailed ? (
            <p className="mb-3 text-sm text-coral">Last delivery attempt failed. Send out again when ready.</p>
          ) : null}
          {!outForDelivery || deliveryFailed ? (
            <>
              <label className="block text-sm">
                Rider name (if any)
                <input
                  value={riderName}
                  onChange={(event) => setRiderName(event.target.value)}
                  className={`${adminInputClass} mt-1.5`}
                />
              </label>
              <button
                type="button"
                onClick={() => run("out", { riderName })}
                className={`${adminButtonClass("secondary")} mt-4 w-full`}
              >
                Mark out for delivery
              </button>
            </>
          ) : (
            <p className="text-sm text-navy/70">Out for delivery</p>
          )}
          {outForDelivery ? (
            <>
              <button
                type="button"
                onClick={() => run("delivered")}
                className={`${adminButtonClass("secondary")} mt-4 w-full`}
              >
                Mark delivered
              </button>
              <label className="mt-3 block text-sm">
                Why it failed (optional)
                <input
                  value={failureReason}
                  onChange={(event) => setFailureReason(event.target.value)}
                  placeholder="Customer unavailable, wrong address…"
                  className={`${adminInputClass} mt-1.5`}
                />
              </label>
              <button
                type="button"
                onClick={() => run("delivery-failed", { reason: failureReason })}
                className={`${adminButtonClass("danger")} mt-3 w-full`}
              >
                Delivery failed
              </button>
            </>
          ) : null}
        </AdminCard>
      ) : delivered && canOperate ? (
        <AdminCard>
          <p className="text-sm text-navy/75">Delivered.</p>
        </AdminCard>
      ) : null}

      {canOperate && delivered ? (
        <button type="button" onClick={() => run("complete")} className={`${adminButtonClass("secondary")} w-full`}>
          Mark completed
        </button>
      ) : null}

      <button type="button" onClick={() => run("cancel")} className={`${adminButtonClass("danger")} w-full`}>
        {isEnquiry ? "Cancel order request" : "Cancel order"}
      </button>
      {error ? <p className="text-sm text-coral">{error}</p> : null}
    </div>
  );
}
