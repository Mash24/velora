import { BUSINESS } from "@/lib/constants";
import Link from "next/link";

export const metadata = { title: "Delivery" };

export default function DeliveryPage() {
  return (
    <div className="site-container-narrow page-py min-w-0">
      <h1 className="text-3xl font-semibold">Delivery</h1>
      <p className="mt-4 text-navy">
        We deliver in Nairobi and arrange courier delivery to other parts of Kenya. Delivery cost
        and timing depend on your location and the size of the order.
      </p>
      <p className="mt-4 text-navy">
        You can also collect from the shop. Pay with M-Pesa, cash, or pay on delivery.
      </p>
      <p className="mt-4 text-navy">{BUSINESS.location}</p>
      <Link href="/shop" className="mt-8 inline-flex min-h-11 items-center text-sm text-teal">
        Shop products
      </Link>
    </div>
  );
}
