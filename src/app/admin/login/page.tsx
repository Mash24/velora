"use client";

import { BrandLogo } from "@/components/store/BrandLogo";
import { adminButtonClass, adminInputClass, adminLabelClass } from "@/components/admin/ui";
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
      setError("Email or password is not correct.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-navy">
      <div
        aria-hidden
        className="absolute -top-24 right-[-4rem] h-72 w-72 rounded-full bg-teal/35 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-28 left-[-3rem] h-64 w-64 rounded-full bg-coral/20 blur-3xl"
      />

      <div className="relative flex min-h-dvh items-center justify-center px-4 py-12 supports-[padding:max(0px)]:pb-[max(3rem,env(safe-area-inset-bottom))]">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-sm min-w-0 rounded-3xl border border-white/10 bg-cream p-6 shadow-[0_24px_64px_rgba(0,0,0,0.28)] sm:p-8"
        >
          <BrandLogo className="mx-auto h-16 w-auto sm:h-20" />
          <h1 className="mt-5 text-center text-xl font-semibold tracking-tight text-navy">Sign in</h1>
          <p className="mt-1 text-center text-sm text-navy/55">Velora back office</p>

          <label className={`${adminLabelClass} mt-6`}>
            Email
            <input
              name="email"
              type="email"
              required
              autoComplete="username"
              className={`${adminInputClass} mt-1.5 bg-paper`}
            />
          </label>
          <label className={`${adminLabelClass} mt-4`}>
            Password
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className={`${adminInputClass} mt-1.5 bg-paper`}
            />
          </label>

          {error ? <p className="mt-4 text-sm text-coral">{error}</p> : null}

          <button type="submit" className={`${adminButtonClass("primary")} mt-6 min-h-11 w-full rounded-xl`}>
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
