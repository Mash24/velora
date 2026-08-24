import { CategoryGlyph } from "@/components/store/CategoryGlyph";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type CategoryScrollRowProps = {
  categories: Category[];
};

export function CategoryScrollRow({ categories }: CategoryScrollRowProps) {
  if (categories.length === 0) return null;

  return (
    <section id="categories" className="scroll-mt-20 border-b border-navy/10 bg-white md:border-b-0 md:bg-transparent">
      <div className="site-container py-5 sm:py-6 md:hidden">
        {/* Clickable section heading with chevron */}
        <Link
          href="/shop"
          className="group flex items-center justify-between gap-3"
          aria-label="Shop by category — view all"
        >
          <h2 className="text-base font-bold tracking-tight text-navy">Shop by category</h2>
          <span className="flex items-center gap-0.5 text-sm font-semibold text-teal transition group-hover:gap-1.5">
            View all <ChevronRight className="h-4 w-4" />
          </span>
        </Link>

        <div className="scroll-row scroll-row-bleed mt-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.slug}`}
              className="scroll-row-item flex w-[7.5rem] flex-col items-center gap-2 rounded-xl border border-navy/12 bg-white p-3 text-center shadow-[0_2px_12px_rgba(22,52,76,0.07)] transition active:scale-[0.97]"
            >
              <CategoryGlyph slug={category.slug} size="sm" />
              <span className="line-clamp-2 text-xs font-bold leading-snug text-navy">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
