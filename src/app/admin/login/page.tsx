"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    if (!response.ok) {
      setError("Invalid login.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="grid min-h-screen place-items-center bg-navy px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl bg-cream p-6">
        <h1 className="text-xl font-semibold text-navy">Velora admin</h1>
        <label className="mt-4 block text-sm text-navy">
          Email
          <input name="email" type="email" required className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2" />
        </label>
        <label className="mt-3 block text-sm text-navy">
          Password
          <input name="password" type="password" required className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2" />
        </label>
        {error ? <p className="mt-3 text-sm text-coral">{error}</p> : null}
        <button className="mt-5 w-full rounded-full bg-navy py-2 text-sm text-cream">Sign in</button>
      </form>
    </div>
  );
}
