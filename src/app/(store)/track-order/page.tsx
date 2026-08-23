import { Suspense } from "react";
import TrackOrderClient from "./TrackOrderClient";

export const metadata = {
  title: "Track your order",
  description: "Check the status of your Velora Medical Supplies order.",
};

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="site-container-narrow page-py min-w-0">Loading...</div>}>
      <TrackOrderClient />
    </Suspense>
  );
}
