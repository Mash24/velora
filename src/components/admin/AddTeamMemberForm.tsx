"use client";

import {
  AdminNotice,
  adminButtonClass,
  adminInputClass,
  adminLabelClass,
} from "@/components/admin/ui";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function AddTeamMemberForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [role, setRole] = useState<"STAFF" | "ADMIN">("STAFF");
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    if (password.length < 8) {
      setBusy(false);
      setError("Use a password with at least 8 characters.");
      return;
    }
    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password,
        role,
      }),
    });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) {
      setError(data.error ?? "Could not add that account.");
      return;
    }
    event.currentTarget.reset();
    setRole("STAFF");
    setMessage(
      `${data.user.name} can sign in now. Share their email and password with them privately.`,
    );
    router.refresh();
  }

  return (
    <section className="rounded-2xl border border-navy/8 bg-white p-5 shadow-[0_1px_2px_rgba(22,52,76,0.04),0_10px_28px_rgba(22,52,76,0.05)] sm:p-6">
      <h2 className="font-semibold tracking-tight text-navy">Add a team member</h2>
      <p className="mt-1 text-sm text-navy/55">
        They use the same admin login page with their own email and password.
      </p>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={adminLabelClass}>
            Full name
            <input
              name="name"
              required
              placeholder="Jane Wanjiku"
              className={`${adminInputClass} mt-1.5`}
              autoComplete="off"
            />
          </label>
          <label className={adminLabelClass}>
            Email
            <input
              name="email"
              type="email"
              required
              placeholder="jane@velora.co.ke"
              className={`${adminInputClass} mt-1.5`}
              autoComplete="off"
            />
          </label>
        </div>

        <label className={adminLabelClass}>
          Temporary password
          <span className="mt-0.5 block text-xs font-normal text-navy/55">
            At least 8 characters. They can change it later if you add that.
          </span>
          <div className="mt-1.5 flex gap-2">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              placeholder="••••••••"
              className={`${adminInputClass} flex-1`}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className={`${adminButtonClass("secondary")} shrink-0`}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        <div>
          <p className={`${adminLabelClass} mb-2`}>Access level</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <RoleChoice
              active={role === "STAFF"}
              title="Staff"
              subtitle="Orders, stock, products, sales"
              onClick={() => setRole("STAFF")}
            />
            <RoleChoice
              active={role === "ADMIN"}
              title="Admin"
              subtitle="Everything, including team accounts"
              onClick={() => setRole("ADMIN")}
            />
          </div>
        </div>

        {error ? <AdminNotice tone="warn">{error}</AdminNotice> : null}
        {message ? <AdminNotice tone="success">{message}</AdminNotice> : null}

        <button type="submit" disabled={busy} className={adminButtonClass("primary")}>
          {busy ? "Creating…" : "Create account"}
        </button>
      </form>
    </section>
  );
}

function RoleChoice({
  active,
  title,
  subtitle,
  onClick,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3.5 py-3.5 text-left transition ${
        active
          ? "border-teal/40 bg-teal/[0.07] shadow-sm ring-1 ring-teal/15"
          : "border-navy/10 bg-sand/20 hover:border-navy/20 hover:bg-white"
      }`}
    >
      <span className="flex items-center gap-2">
        <span
          className={`inline-flex h-4 w-4 items-center justify-center rounded-full border-2 ${
            active ? "border-teal" : "border-navy/25"
          }`}
        >
          {active ? <span className="h-2 w-2 rounded-full bg-teal" /> : null}
        </span>
        <span className="text-sm font-semibold text-navy">{title}</span>
      </span>
      <span className="mt-1.5 block pl-6 text-xs leading-5 text-navy/55">{subtitle}</span>
    </button>
  );
}
