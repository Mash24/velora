"use client";

import { BrandLogo } from "@/components/store/BrandLogo";
import {
  LayoutDashboard,
  Menu,
  Package,
  ShoppingBag,
  Warehouse,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminNav } from "./AdminNav";

const tabs = [
  { href: "/admin", label: "Home", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/inventory", label: "Stock", icon: Warehouse },
];

function tabActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen min-w-0 bg-[linear-gradient(165deg,#faf8f4_0%,#f3eee6_52%,#ece4d6_100%)]">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-navy/8 bg-paper/90 px-4 py-2.5 backdrop-blur-md supports-[padding:max(0px)]:pt-[max(0.65rem,env(safe-area-inset-top))] lg:hidden">
        <Link href="/admin" className="inline-flex min-w-0 shrink-0 items-center">
          <BrandLogo className="h-9 w-auto" />
        </Link>
        <p className="truncate text-xs font-semibold uppercase tracking-[0.16em] text-navy/50">
          Admin
        </p>
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
          className="fixed inset-0 z-40 bg-navy/45 backdrop-blur-[2px] lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div className="lg:flex">
        <aside
          className={`z-50 flex w-[min(18rem,88vw)] max-w-full flex-col bg-navy text-cream shadow-2xl transition-transform duration-200 max-lg:fixed max-lg:inset-y-0 max-lg:left-0 lg:sticky lg:top-0 lg:h-screen lg:w-[17.5rem] lg:shrink-0 lg:shadow-none ${
            mobileOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full"
          }`}
          style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-4 lg:hidden">
            <span className="text-sm font-semibold">Menu</span>
            <button
              type="button"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-cream"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="hidden border-b border-white/10 px-5 py-7 lg:block">
            <Link href="/admin">
              <BrandLogo onDark className="h-11 w-auto" />
            </Link>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-teal">
              Back office
            </p>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-4">
            <AdminNav onNavigate={() => setMobileOpen(false)} />
          </div>

          <form
            action="/api/admin/logout"
            method="post"
            className="border-t border-white/10 p-3"
            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }}
          >
            <button
              type="submit"
              className="flex min-h-11 w-full items-center rounded-xl px-3 text-left text-sm text-cream/80 transition hover:bg-white/10 hover:text-cream"
            >
              Sign out
            </button>
          </form>
        </aside>

        <main className="min-w-0 flex-1 pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
          <div className="admin-container py-5 sm:py-7 lg:py-10">{children}</div>
        </main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-navy/10 bg-paper/95 px-1 pt-1.5 backdrop-blur-md lg:hidden"
        style={{ paddingBottom: "max(0.4rem, env(safe-area-inset-bottom))" }}
        aria-label="Admin shortcuts"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tabActive(pathname, tab.href, tab.exact);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-semibold ${
                isActive ? "text-teal" : "text-navy/55"
              }`}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
