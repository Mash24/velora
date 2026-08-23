import { BUSINESS } from "@/lib/constants";
import { whatsappLink } from "@/lib/whatsapp";
import Link from "next/link";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="site-container-narrow page-py min-w-0">
      <h1 className="text-3xl font-semibold">Contact</h1>
      <p className="mt-4 text-navy/80">
        Browse the shop and submit your order request on the website. We’ll confirm availability and
        delivery with you before payment.
      </p>
      <p className="mt-4 text-navy/80">{BUSINESS.location}</p>
      <p className="text-navy/80">{BUSINESS.landmark}</p>
      <p className="mt-4 text-navy/80">{BUSINESS.phoneDisplay}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/shop"
          className="inline-flex min-h-11 items-center rounded-full bg-navy px-5 py-3 text-sm font-medium text-cream"
        >
          Browse products
        </Link>
        <Link
          href="/your-order"
          className="inline-flex min-h-11 items-center rounded-full border border-navy/15 px-5 py-3 text-sm"
        >
          Your order
        </Link>
      </div>
      <p className="mt-8 text-sm text-navy/70">
        Need help finding something?{" "}
        <a className="text-teal" href={whatsappLink("Hello Velora, I need help finding a product.")}>
          Chat with us
        </a>
        .
      </p>
    </div>
  );
}
