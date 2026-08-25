import { AddToOrderButton } from "@/components/store/AddToOrderButton";
import { formatKes } from "@/lib/format";
import { availabilityTone, publicAvailability } from "@/lib/labels";
import Image from "next/image";
import Link from "next/link";

type ProductCardProps = {
  id: string;
  name: string;
  slug: string;
  priceKes: number;
  unit: string;
  shortDescription?: string;
  stockQuantity: number;
  askForAvailability?: boolean;
  images?: { url: string; alt: string | null }[];
};

export function ProductCard({
  id,
  name,
  slug,
  priceKes,
  unit,
  stockQuantity,
  askForAvailability = false,
  images = [],
}: ProductCardProps) {
  const availability = publicAvailability(stockQuantity, askForAvailability);
  const image = images[0];

  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-navy/10 bg-white shadow-[0_8px_24px_rgba(22,52,76,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(22,52,76,0.08)] sm:rounded-2xl">
      <Link href={`/product/${slug}`} className="min-w-0">
        <div className="relative aspect-square overflow-hidden bg-mist/60 p-2 sm:p-3">
          {image ? (
            <Image
              src={image.url}
              alt={image.alt || name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-contain p-2 sm:p-3"
            />
          ) : (
            <div className="grid h-full place-items-center text-[10px] uppercase tracking-[0.18em] text-teal sm:text-xs">
              Velora
            </div>
          )}
        </div>
        <div className="px-2.5 pt-2.5 sm:px-3.5 sm:pt-3">
          <h3 className="line-clamp-2 min-h-[2.4em] text-[13px] leading-snug font-semibold tracking-tight text-navy sm:min-h-0 sm:text-sm md:text-base">
            {name}
          </h3>
          <p className="mt-1.5 text-sm font-bold tabular-nums text-navy sm:text-base">
            {formatKes(priceKes)}
          </p>
          <p className="truncate text-[11px] text-navy/55 sm:text-xs">{unit}</p>
          <p className={`mt-1 text-[11px] font-medium sm:text-xs ${availabilityTone(availability)}`}>
            {availability}
          </p>
        </div>
      </Link>
      <div className="mt-auto px-2.5 pt-2 pb-2.5 sm:px-3.5 sm:pt-3 sm:pb-3.5">
        <AddToOrderButton
          productId={id}
          name={name}
          unit={unit}
          priceKes={priceKes}
          inStock={stockQuantity > 0}
          askUs={askForAvailability}
          imageUrl={image?.url}
          compact
        />
      </div>
    </article>
  );
}
