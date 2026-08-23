import { BrandLogo } from "@/components/store/BrandLogo";
import { BUSINESS } from "@/lib/constants";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="site-container-narrow page-py min-w-0">
      <BrandLogo className="h-28 w-auto" />
      <h1 className="mt-6 text-3xl font-semibold">About Velora</h1>
      <p className="mt-4 text-navy">
        Velora Medical Supplies sells non-pharmaceutical medical products to individuals, caregivers
        and healthcare customers across Kenya. You can order online or visit the Nairobi shop.
      </p>
      <p className="mt-4 text-navy">{BUSINESS.location}</p>
      <p className="text-navy">{BUSINESS.landmark}</p>
    </div>
  );
}
