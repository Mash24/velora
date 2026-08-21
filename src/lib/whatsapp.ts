import { BUSINESS } from "./constants";

export function whatsappLink(message: string) {
  return `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function productEnquiryMessage(name: string, priceKes: number) {
  return `Hi Velora, I would like to order ${name} (KSh ${priceKes.toLocaleString("en-KE")}).`;
}

export function orderWhatsappMessage(orderNumber: string, lines: string[], totalKes: number) {
  return [
    `Hi Velora, I would like to place order ${orderNumber}.`,
    "",
    ...lines,
    "",
    `Total: KSh ${totalKes.toLocaleString("en-KE")}`,
  ].join("\n");
}
