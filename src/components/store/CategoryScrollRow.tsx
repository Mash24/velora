import { CategoryGlyph } from "@/components/store/CategoryGlyph";
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
    <section className="scroll-mt-20 border-b border-navy/10 bg-white md:border-b-0 md:bg-transparent">
      <div className="site-container py-5 sm:py-6 md:hidden">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">Shop by category</h2>
          <Link href="/shop" className="shrink-0 text-sm font-medium text-teal">
            View all
          </Link>
        </div>
        <div className="scroll-row scroll-row-bleed mt-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.slug}`}
              className="scroll-row-item flex w-[6.75rem] flex-col items-center gap-2 rounded-xl border border-navy/10 bg-paper p-3 text-center shadow-[0_4px_16px_rgba(22,52,76,0.04)] transition active:scale-[0.98]"
            >
              <CategoryGlyph slug={category.slug} size="sm" />
              <span className="line-clamp-2 text-xs leading-snug font-semibold text-navy">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
