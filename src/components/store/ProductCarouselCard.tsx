import { priceWithUnit } from "@/lib/format";
import { availabilityTone, publicAvailability } from "@/lib/labels";
import Link from "next/link";

type ProductCarouselCardProps = {
  name: string;
  slug: string;
  priceKes: number;
  unit: string;
  stockQuantity: number;
  askForAvailability?: boolean;
  images?: { url: string; alt: string | null }[];
};

export function ProductCarouselCard({
  name,
  slug,
  priceKes,
  unit,
  stockQuantity,
  askForAvailability = false,
  images = [],
}: ProductCarouselCardProps) {
  const availability = publicAvailability(stockQuantity, askForAvailability);
  const image = images[0];

  return (
    <article className="scroll-row-item flex w-[9.5rem] flex-col rounded-xl border border-navy/10 bg-white p-2.5 shadow-[0_4px_16px_rgba(22,52,76,0.04)]">
      <Link href={`/product/${slug}`} className="block">
        <div className="aspect-square overflow-hidden rounded-lg bg-mist">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image.url}
              alt={image.alt || name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="grid h-full place-items-center text-[10px] uppercase tracking-[0.18em] text-teal">
              Velora
            </div>
          )}
        </div>
        <h3 className="mt-2 line-clamp-2 text-sm leading-snug font-semibold text-navy">{name}</h3>
        <p className="mt-1 text-sm font-semibold tabular-nums text-navy">
          {priceWithUnit(priceKes, unit)}
        </p>
        <p className={`mt-0.5 text-[11px] ${availabilityTone(availability)}`}>{availability}</p>
      </Link>
    </article>
  );
}
