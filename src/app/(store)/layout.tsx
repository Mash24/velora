import { Footer, Header } from "@/components/store/SiteChrome";
import { SourceCapture } from "@/components/store/SourceCapture";
import { WhatsAppFloat } from "@/components/store/WhatsAppFloat";
import { getNavCategories } from "@/lib/store-data";
import { Suspense } from "react";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const categories = await getNavCategories();

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
