import { AddToOrderButton } from "@/components/store/AddToOrderButton";
import { priceWithUnit } from "@/lib/format";
import { availabilityTone, publicAvailability } from "@/lib/labels";
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
  shortDescription,
  stockQuantity,
  askForAvailability = false,
  images = [],
}: ProductCardProps) {
  const availability = publicAvailability(stockQuantity, askForAvailability);
  const image = images[0];

  return (
    <article className="flex min-w-0 flex-col rounded-2xl border border-navy/10 bg-white p-3 shadow-[0_8px_24px_rgba(22,52,76,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(22,52,76,0.08)] sm:p-4">
      <div className="mb-4 aspect-[4/3] overflow-hidden rounded-xl bg-white ring-1 ring-navy/5 sm:mb-5">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.url}
            alt={image.alt || name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="grid h-full place-items-center bg-mist text-teal">
            <span className="text-xs uppercase tracking-[0.2em]">Velora</span>
          </div>
        )}
      </div>
      <h3 className="line-clamp-2 text-base font-semibold tracking-tight text-navy sm:text-lg">
        <Link href={`/product/${slug}`} className="break-anywhere">
          {name}
        </Link>
      </h3>
      <p className="mt-2 text-base font-semibold tabular-nums text-navy sm:text-lg">
        {priceWithUnit(priceKes, unit)}
      </p>
      <p className={`mt-1 text-sm ${availabilityTone(availability)}`}>{availability}</p>
      {shortDescription ? (
        <p className="mt-2 line-clamp-2 text-sm text-navy/85">{shortDescription}</p>
      ) : null}
      <div className="mt-auto flex flex-col gap-2.5 pt-4">
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
        <Link href={`/product/${slug}`} className="text-center text-sm font-medium text-teal">
          View product
        </Link>
      </div>
    </article>
  );
}
