"use client";

import {
  FolderTree,
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  UserCog,
  Users,
  Warehouse,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

const groups: {
  title: string;
  links: { href: string; label: string; icon: LucideIcon; exact?: boolean }[];
}[] = [
  {
    title: "Today",
    links: [
      { href: "/admin", label: "Home", icon: LayoutDashboard, exact: true },
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
      { href: "/admin/sales/new", label: "Record a sale", icon: PlusCircle },
    ],
  },
  {
    title: "Shop",
    links: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/inventory", label: "Stock", icon: Warehouse },
      { href: "/admin/categories", label: "Categories", icon: FolderTree },
    ],
  },
  {
    title: "People",
    links: [
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/team", label: "Team", icon: UserCog },
    ],
  },
];

function active(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-6">
      {groups.map((group) => (
        <div key={group.title}>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-teal/80">
            {group.title}
          </p>
          <ul className="space-y-0.5">
            {group.links.map((link) => {
              const isActive = active(pathname, link.href, link.exact);
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onNavigate}
                    className={`flex min-h-11 min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? "bg-teal text-white shadow-[0_6px_16px_rgba(14,124,123,0.35)]"
                        : "text-cream/85 hover:bg-white/10 hover:text-cream"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="min-w-0 truncate">{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
