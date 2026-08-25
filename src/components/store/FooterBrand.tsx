import { BrandLogo } from "@/components/store/BrandLogo";
import Link from "next/link";

/** Real brand mark — same colours as the header, on the light footer. */
export function FooterBrand() {
  return (
    <Link
      href="/"
      aria-label="Velora Medical Supplies — home"
      className="inline-flex focus-visible:outline-offset-4"
    >
      <BrandLogo className="h-16 w-auto sm:h-[4.75rem]" />
    </Link>
  );
}
