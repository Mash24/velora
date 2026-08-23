import Link from "next/link";

type CollageItem = {
  url: string;
  alt: string;
  slug: string;
};

type ProductCollageProps = {
  items: CollageItem[];
};

/** Compact product mosaic for mobile hero — signals inventory at a glance. */
export function ProductCollage({ items }: ProductCollageProps) {
  if (items.length === 0) {
    return (
      <div
        className="grid h-36 grid-cols-2 gap-1.5 rounded-2xl bg-gradient-to-br from-teal/10 via-mist to-navy/5 p-1.5"
        aria-hidden
      >
        {[0, 1, 2, 3].map((slot) => (
          <div key={slot} className="rounded-xl bg-white/70" />
        ))}
      </div>
    );
  }

  const slots = items.slice(0, 4);
  const layout = ["col-span-2 row-span-2", "", "", "col-span-2"] as const;

  return (
    <div className="grid h-36 grid-cols-4 grid-rows-2 gap-1.5 rounded-2xl bg-mist/60 p-1.5">
      {slots.map((item, index) => (
        <Link
          key={item.slug}
          href={`/product/${item.slug}`}
          className={`${layout[index] ?? ""} relative overflow-hidden rounded-xl bg-white ring-1 ring-navy/5 transition active:scale-[0.98]`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.url} alt={item.alt} className="h-full w-full object-cover" />
        </Link>
      ))}
    </div>
  );
}
