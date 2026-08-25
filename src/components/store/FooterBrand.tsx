import { BrandLogo } from "@/components/store/BrandLogo";
import Link from "next/link";

/** Real brand mark on a light surface so teal/navy colours stay correct on the navy footer. */
export function FooterBrand() {
  return (
    <Link
      href="/"
      aria-label="Velora Medical Supplies — home"
      className="inline-block max-w-xs focus-visible:outline-offset-4"
    >
      <span className="inline-flex rounded-2xl bg-cream p-3 shadow-sm ring-1 ring-inset ring-cream/20 sm:p-3.5">
        <BrandLogo className="h-[4.5rem] w-auto sm:h-20" />
      </span>
    </Link>
  );
}
