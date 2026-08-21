import Link from "next/link";

export const dynamic = "force-dynamic";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
];

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full bg-sand">
      <div className="flex min-h-screen">
        <aside className="hidden w-56 bg-navy p-5 text-cream sm:block">
          <p className="font-semibold">Velora</p>
          <p className="text-xs text-cream/60">Back office</p>
          <nav className="mt-8 grid gap-2 text-sm">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-lg px-2 py-1.5 hover:bg-white/10">
                {link.label}
              </Link>
            ))}
          </nav>
          <form action="/api/admin/logout" method="post" className="mt-8">
            <button className="text-sm text-cream/70">Sign out</button>
          </form>
        </aside>
        <div className="flex-1 p-6">{children}</div>
      </div>
    </div>
  );
}
