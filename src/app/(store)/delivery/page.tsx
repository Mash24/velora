import { BUSINESS } from "@/lib/constants";
import Link from "next/link";

export const metadata = { title: "Delivery" };

export default function DeliveryPage() {
  return (
    <div className="site-container-narrow page-py min-w-0">
      <h1 className="text-3xl font-semibold">Delivery</h1>
      <p className="mt-4 text-navy">
        We serve customers in Nairobi and arrange delivery to other parts of Kenya. Delivery cost
        and timing depend on your location and order. You also pay for delivery. We’ll confirm these
        details before payment.
      </p>
      <p className="mt-4 text-navy">
        We’ll confirm the total and payment options before you pay. How and when you pay is agreed
        when we confirm the order.
      </p>
      <p className="mt-4 text-navy">{BUSINESS.location}</p>
      <Link href="/shop" className="mt-8 inline-flex min-h-11 items-center text-sm text-teal">
        Shop products
      </Link>
    </div>
  );
}
