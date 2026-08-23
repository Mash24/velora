"use client";

import { BrandLogo } from "@/components/store/BrandLogo";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminNav } from "./AdminNav";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen min-w-0 bg-[linear-gradient(165deg,#faf8f4_0%,#f0ebe3_48%,#ebe4d8_100%)]">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-navy/8 bg-paper/95 px-4 py-3 backdrop-blur-md supports-[padding:max(0px)]:pt-[env(safe-area-inset-top)] lg:hidden">
        <Link href="/admin" className="min-w-0 shrink" onClick={() => setMobileOpen(false)}>
          <BrandLogo className="h-10 w-auto" />
        </Link>
        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-navy/10 bg-white text-navy shadow-sm"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-navy/40 backdrop-blur-[1px] lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div className="lg:flex">
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-[min(17.5rem,88vw)] max-w-full flex-col border-r border-white/8 bg-[linear-gradient(180deg,#17384f_0%,#122a3d_100%)] text-cream shadow-xl transition-transform duration-200 lg:static lg:min-h-screen lg:w-[17.5rem] lg:translate-x-0 lg:shadow-none ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
        >
          <div className="flex items-center justify-between border-b border-white/8 px-4 py-4 lg:hidden">
            <span className="text-sm font-semibold text-cream">Menu</span>
            <button
              type="button"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-cream"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="hidden border-b border-white/8 px-5 py-6 lg:block">
            <Link href="/admin" onClick={() => setMobileOpen(false)}>
              <BrandLogo className="h-11 w-auto" />
            </Link>
            <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.18em] text-cream/70">
              Velora admin
            </p>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-4 lg:py-2">
            <AdminNav onNavigate={() => setMobileOpen(false)} />
          </div>

          <form
            action="/api/admin/logout"
            method="post"
            className="border-t border-white/8 p-3"
            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }}
          >
            <button
              type="submit"
              className="flex min-h-11 w-full items-center rounded-xl px-3 text-left text-sm text-cream/85 transition hover:bg-white/8 hover:text-cream"
            >
              Sign out
            </button>
          </form>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="admin-container py-6 lg:py-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
