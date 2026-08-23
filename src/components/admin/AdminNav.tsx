"use client";

import {
  FolderTree,
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  Tags,
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
    title: "Day to day",
    links: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
      { href: "/admin/sales/new", label: "Record sale", icon: PlusCircle },
    ],
  },
  {
    title: "Catalogue",
    links: [
      { href: "/admin/inventory", label: "Inventory", icon: Warehouse },
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/categories", label: "Categories", icon: FolderTree },
    ],
  },
  {
    title: "People",
    links: [
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/team", label: "Team", icon: Tags },
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
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-cream/70">
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
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? "bg-white/14 text-cream"
                        : "text-cream/85 hover:bg-white/8 hover:text-cream"
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-cream" : "text-cream/70"}`} />
                    {link.label}
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
