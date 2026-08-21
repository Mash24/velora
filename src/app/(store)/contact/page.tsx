import { BUSINESS } from "@/lib/constants";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Contact</h1>
      <p className="mt-4 text-navy/80">
        WhatsApp is the fastest way to order. Wendy currently handles enquiries directly.
      </p>
      <a
        href={whatsappLink("Hi Velora, I would like to make an enquiry.")}
        className="mt-6 inline-flex rounded-full bg-whatsapp px-5 py-3 text-sm font-medium text-white"
      >
        Message {BUSINESS.phoneDisplay}
      </a>
      <p className="mt-8 text-navy/80">{BUSINESS.location}</p>
    </div>
  );
}
