import { BUSINESS } from "@/lib/constants";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold">About Velora</h1>
      <p className="mt-4 text-navy/80">
        Velora Medical Supplies sells non-pharmaceutical medical products to individuals, caregivers
        and healthcare customers across Kenya. You can order online or visit the Nairobi shop.
      </p>
      <p className="mt-4 text-navy/80">{BUSINESS.location}</p>
      <p className="text-navy/80">{BUSINESS.landmark}</p>
    </div>
  );
}
