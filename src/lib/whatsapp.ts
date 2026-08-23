import { BUSINESS } from "./constants";

export function whatsappLink(message: string) {
  return `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function productQuestionMessage(name: string) {
  return `Hello Velora, I have a question about ${name}.`;
}

export function orderWhatsappMessage(
  lines: string[],
  location: string,
  deliveryArea: string,
  customerName: string,
  orderNumber?: string,
) {
  return [
    orderNumber
      ? `Hello Velora, I submitted order request ${orderNumber}.`
      : "Hello Velora, I submitted an order request on the website.",
    "",
    ...lines.map((line, index) => `${index + 1}. ${line}`),
    "",
    `Name: ${customerName}`,
    `Location: ${location}`,
    `Delivery: ${deliveryArea}`,
    "Please confirm availability and delivery.",
  ]
    .filter(Boolean)
    .join("\n");
}
