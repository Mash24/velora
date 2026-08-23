import { ProductCarouselCard } from "@/components/store/ProductCarouselCard";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  slug: string;
  priceKes: number;
  unit: string;
  stockQuantity: number;
  askForAvailability?: boolean;
  images?: { url: string; alt: string | null }[];
};

type ProductScrollRowProps = {
  products: Product[];
};

export function ProductScrollRow({ products }: ProductScrollRowProps) {
  if (products.length === 0) return null;

  return (
    <section className="border-b border-navy/10 bg-paper md:border-b-0 md:bg-transparent">
      <div className="site-container py-5 sm:py-6 md:hidden">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">Featured products</h2>
          <Link href="/shop" className="shrink-0 text-sm font-medium text-teal">
            View all
          </Link>
        </div>
        <div className="scroll-row scroll-row-bleed mt-3">
          {products.map((product) => (
            <ProductCarouselCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
}
