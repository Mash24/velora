"use client";

import { AdminNotice, adminButtonClass, adminInputClass, adminSelectClass } from "@/components/admin/ui";
import { formatKes } from "@/lib/format";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function OrderActions({
  orderId,
  status,
  paymentStatus,
  deliveryStatus,
  totalKes,
  pickup,
}: {
  orderId: string;
  status: string;
  paymentStatus: string;
  deliveryStatus: string;
  totalKes: number;
  pickup?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [mpesaCode, setMpesaCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("MPESA");
  const [failureReason, setFailureReason] = useState("");
  const [showFailed, setShowFailed] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const isEnquiry = status === "ENQUIRY";
  const isOpen = status === "CONFIRMED" || status === "PROCESSING";
  const unpaid = paymentStatus !== "PAID";
  const delivered = deliveryStatus === "DELIVERED";

  async function run(action: string, extra?: Record<string, string>) {
    setBusy(true);
    setError("");
    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) {
      setError(data.error ?? "Could not update the order.");
      return;
    }
    setCancelOpen(false);
    setShowFailed(false);
    router.refresh();
  }

  if (status === "COMPLETED" || status === "CANCELLED") {
    return null;
  }

  if (isEnquiry) {
    return (
      <div className="mt-6 border-t border-navy/8 pt-6">
        {cancelOpen ? (
          <CancelConfirm
            busy={busy}
            message="The customer will not be charged. You can still call them later."
            confirmLabel="Yes, cancel request"
            onConfirm={() => run("cancel")}
            onKeep={() => setCancelOpen(false)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setCancelOpen(true)}
            className="text-sm font-medium text-navy/45 underline-offset-2 hover:text-coral hover:underline"
          >
            Cancel this order request
          </button>
        )}
        {error ? (
          <div className="mt-3">
            <AdminNotice tone="warn">{error}</AdminNotice>
          </div>
        ) : null}
      </div>
    );
  }

  if (!isOpen) return null;

  const step = unpaid ? 1 : !delivered ? 2 : 3;

  return (
    <div className="mt-6 space-y-4">
      <section className="rounded-2xl border border-navy/8 bg-white p-4 shadow-[0_1px_2px_rgba(22,52,76,0.04),0_8px_24px_rgba(22,52,76,0.04)] sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-navy/45">Finish this order</p>
        <ol className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <Step n={1} active={step === 1} done={step > 1} label="Paid" />
          <Step n={2} active={step === 2} done={step > 2} label={pickup ? "Collected" : "Delivered"} />
          <Step n={3} active={step === 3} done={false} label="Close" />
        </ol>

        {step === 1 ? (
          <div className="mt-5 space-y-3">
            <p className="text-sm text-navy/70">
              Customer pays <span className="font-semibold text-navy">{formatKes(totalKes)}</span>
            </p>
            <label className="block text-sm font-medium text-navy/80">
              How they paid
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
              <label className="block text-sm font-medium text-navy/80">
                M-Pesa code <span className="font-normal text-navy/50">(optional)</span>
                <input
                  value={mpesaCode}
                  onChange={(event) => setMpesaCode(event.target.value)}
                  className={`${adminInputClass} mt-1.5`}
                />
              </label>
            ) : null}
            <button
              type="button"
              disabled={busy}
              onClick={() => run("paid", { mpesaCode, paymentMethod })}
              className={`${adminButtonClass("primary")} mt-1 w-full sm:w-auto sm:min-w-40`}
            >
              {busy ? "Saving…" : "Mark paid"}
            </button>
          </div>
        ) : null}

        {step === 2 && pickup ? (
          <div className="mt-5 space-y-3">
            <p className="text-sm text-navy/70">Customer collects from the shop.</p>
            <button
              type="button"
              disabled={busy}
              onClick={() => run("delivered")}
              className={`${adminButtonClass("primary")} w-full sm:w-auto sm:min-w-40`}
            >
              {busy ? "Saving…" : "Mark collected"}
            </button>
          </div>
        ) : null}

        {step === 2 && !pickup ? (
          <div className="mt-5 space-y-3">
            {deliveryStatus === "FAILED" ? (
              <p className="text-sm text-coral">Last attempt failed. Mark delivered when it succeeds.</p>
            ) : null}
            <button
              type="button"
              disabled={busy}
              onClick={() => run("delivered")}
              className={`${adminButtonClass("primary")} w-full sm:w-auto sm:min-w-40`}
            >
              {busy ? "Saving…" : "Mark delivered"}
            </button>
            {!showFailed ? (
              <button
                type="button"
                onClick={() => setShowFailed(true)}
                className="block text-sm font-medium text-navy/45 underline-offset-2 hover:text-coral hover:underline"
              >
                Delivery failed?
              </button>
            ) : (
              <div className="space-y-2 rounded-xl border border-navy/10 bg-sand/30 p-3">
                <label className="block text-sm font-medium text-navy/80">
                  Why?
                  <input
                    value={failureReason}
                    onChange={(event) => setFailureReason(event.target.value)}
                    placeholder="Customer unavailable, wrong address…"
                    className={`${adminInputClass} mt-1.5`}
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => run("delivery-failed", { reason: failureReason })}
                    className={adminButtonClass("secondary")}
                  >
                    Record failure
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFailed(false)}
                    className={adminButtonClass("ghost")}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {step === 3 ? (
          <div className="mt-5 space-y-3">
            <p className="text-sm text-navy/70">Paid and {pickup ? "collected" : "delivered"}. Nothing left to do.</p>
            <button
              type="button"
              disabled={busy}
              onClick={() => run("complete")}
              className={`${adminButtonClass("primary")} w-full sm:w-auto sm:min-w-40`}
            >
              {busy ? "Closing…" : "Close order"}
            </button>
          </div>
        ) : null}
      </section>

      {cancelOpen ? (
        <CancelConfirm
          busy={busy}
          message="Stock that was taken will be put back on the shelf."
          confirmLabel="Yes, cancel order"
          onConfirm={() => run("cancel")}
          onKeep={() => setCancelOpen(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setCancelOpen(true)}
          className="text-sm font-medium text-navy/45 underline-offset-2 hover:text-coral hover:underline"
        >
          Cancel order
        </button>
      )}

      {error ? <AdminNotice tone="warn">{error}</AdminNotice> : null}
    </div>
  );
}

function Step({
  n,
  active,
  done,
  label,
}: {
  n: number;
  active: boolean;
  done: boolean;
  label: string;
}) {
  return (
    <li
      className={`inline-flex items-center gap-1.5 ${
        active ? "font-semibold text-navy" : done ? "text-teal" : "text-navy/40"
      }`}
    >
      <span
        className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
          active
            ? "bg-navy text-cream"
            : done
              ? "bg-teal/15 text-teal"
              : "bg-navy/8 text-navy/45"
        }`}
      >
        {done ? "✓" : n}
      </span>
      {label}
    </li>
  );
}

function CancelConfirm({
  busy,
  message,
  confirmLabel,
  onConfirm,
  onKeep,
}: {
  busy: boolean;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onKeep: () => void;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-coral/30 bg-coral/5 p-4">
      <p className="font-semibold text-navy">Cancel this order?</p>
      <p className="text-sm text-navy/70">{message}</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={onConfirm}
          className={`${adminButtonClass("danger")} border border-coral/30 bg-white`}
        >
          {confirmLabel}
        </button>
        <button type="button" disabled={busy} onClick={onKeep} className={adminButtonClass("secondary")}>
          Keep order
        </button>
      </div>
    </div>
  );
}
