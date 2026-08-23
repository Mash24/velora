import { Footer, Header } from "@/components/store/SiteChrome";
import { SourceCapture } from "@/components/store/SourceCapture";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <Suspense fallback={null}>
        <SourceCapture />
      </Suspense>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
