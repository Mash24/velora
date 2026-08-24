import { Footer, Header } from "@/components/store/SiteChrome";
import { SourceCapture } from "@/components/store/SourceCapture";
import { WhatsAppFloat } from "@/components/store/WhatsAppFloat";
import { prisma } from "@/lib/prisma";
import { categoryWithPublishedProducts } from "@/lib/shop-query";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const categories = await prisma.category.findMany({
    where: categoryWithPublishedProducts,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true },
  });

  return (
    <div className="flex min-h-full flex-col">
      <Suspense fallback={null}>
        <SourceCapture />
      </Suspense>
      <Header categories={categories} />
      <main className="flex-1 pb-20">{children}</main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
