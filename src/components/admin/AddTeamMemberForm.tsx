"use client";

import {
  AdminCard,
  AdminNotice,
  adminButtonClass,
  adminInputClass,
  adminLabelClass,
  adminSelectClass,
} from "@/components/admin/ui";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function AddTeamMemberForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
        role: form.get("role"),
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Could not add that account.");
      return;
    }
    event.currentTarget.reset();
    setMessage(`${data.user.name} can now sign in with their email and password.`);
    router.refresh();
  }

  return (
    <AdminCard
      title="Add a team member"
      description="They sign in at the same admin page with their own email and password. Their name appears on the dashboard when they log in."
      className="mt-8"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <label className={adminLabelClass}>
          Name
          <input name="name" required className={`${adminInputClass} mt-1.5`} />
        </label>
        <label className={adminLabelClass}>
          Email
          <input name="email" type="email" required className={`${adminInputClass} mt-1.5`} />
        </label>
        <label className={adminLabelClass}>
          Password
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className={`${adminInputClass} mt-1.5`}
          />
        </label>
        <label className={adminLabelClass}>
          Access
          <select name="role" defaultValue="STAFF" className={`${adminSelectClass} mt-1.5`}>
            <option value="STAFF">Staff — day-to-day orders and stock</option>
            <option value="ADMIN">Admin — full access including team</option>
          </select>
        </label>
        {error ? <AdminNotice tone="warn">{error}</AdminNotice> : null}
        {message ? <AdminNotice tone="success">{message}</AdminNotice> : null}
        <button type="submit" className={adminButtonClass("primary")}>
          Add account
        </button>
      </form>
    </AdminCard>
  );
}
