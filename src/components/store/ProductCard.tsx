import { formatKes } from "@/lib/format";
import { productEnquiryMessage, whatsappLink } from "@/lib/whatsapp";
import Link from "next/link";

type ProductCardProps = {
  name: string;
  slug: string;
  priceKes: number;
  unit: string;
  stockQuantity: number;
};

export function ProductCard({ name, slug, priceKes, unit, stockQuantity }: ProductCardProps) {
  const inStock = stockQuantity > 0;

  return (
    <article className="flex flex-col rounded-2xl border border-teal-950/10 bg-white p-5 shadow-[0_10px_30px_rgba(18,50,74,0.04)]">
      <div className="mb-4 grid h-36 place-items-center rounded-xl bg-sand text-teal">
        <span className="text-xs uppercase tracking-[0.2em]">Velora</span>
      </div>
      <p className="text-xs uppercase tracking-[0.16em] text-teal">{unit}</p>
      <h3 className="mt-1 text-lg font-semibold text-navy">
        <Link href={`/product/${slug}`}>{name}</Link>
      </h3>
      <p className="mt-2 text-xl font-semibold text-navy">{formatKes(priceKes)}</p>
      <p className={`mt-1 text-sm ${inStock ? "text-teal" : "text-coral"}`}>
        {inStock ? "In stock" : "Out of stock"}
      </p>
      <div className="mt-4 flex gap-2">
        <Link
          href={`/product/${slug}`}
          className="rounded-full border border-navy/15 px-4 py-2 text-sm text-navy"
        >
          View
        </Link>
        <a
          href={whatsappLink(productEnquiryMessage(name, priceKes))}
          className="rounded-full bg-whatsapp px-4 py-2 text-sm font-medium text-white"
        >
          Order on WhatsApp
        </a>
      </div>
    </article>
  );
}
