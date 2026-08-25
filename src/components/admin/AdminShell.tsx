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
    <div className="admin-panel-root bg-[linear-gradient(165deg,#faf8f4_0%,#f3eee6_52%,#ece4d6_100%)]">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-navy/8 bg-paper/90 px-3 py-2.5 backdrop-blur-md supports-[padding:max(0px)]:pt-[max(0.65rem,env(safe-area-inset-top))] sm:gap-3 sm:px-4 lg:hidden">
        <Link href="/admin" className="inline-flex min-w-0 shrink-0 items-center">
          <BrandLogo className="h-8 w-auto sm:h-9" />
        </Link>
        <p className="min-w-0 truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-navy/50 sm:text-xs sm:tracking-[0.16em]">
          Admin
        </p>
        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border border-navy/10 bg-white text-navy shadow-sm"
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

      <div className="min-w-0 lg:flex">
        <aside
          className={`z-50 flex w-[min(18rem,88vw)] max-w-full flex-col bg-navy text-cream shadow-2xl transition-transform duration-200 max-lg:fixed max-lg:inset-y-0 max-lg:left-0 lg:sticky lg:top-0 lg:h-[100dvh] lg:w-[clamp(14rem,20vw,17.5rem)] lg:shrink-0 lg:shadow-none ${
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
              <BrandLogo onDark className="h-11 w-auto max-w-full" />
            </Link>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-teal">
              Shop admin
            </p>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-3 py-4">
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

        <main className="min-w-0 flex-1 overflow-x-clip pb-[calc(4.85rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
          <div className="admin-container py-5 sm:py-7 lg:py-10">{children}</div>
        </main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-navy/10 bg-paper/95 px-1 pt-1.5 backdrop-blur-md lg:hidden"
        style={{
          paddingBottom: "max(0.4rem, env(safe-area-inset-bottom))",
          paddingLeft: "max(0.25rem, env(safe-area-inset-left))",
          paddingRight: "max(0.25rem, env(safe-area-inset-right))",
        }}
        aria-label="Admin shortcuts"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tabActive(pathname, tab.href, tab.exact);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex min-h-12 min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 text-[10px] font-semibold leading-tight ${
                isActive ? "text-teal" : "text-navy/55"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="max-w-full truncate">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
