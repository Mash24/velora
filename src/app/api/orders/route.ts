import { CustomerSource, DeliveryZone, PaymentMethod } from "@prisma/client";
import { NextResponse } from "next/server";
import { BUSINESS, MAX_ORDER_LINE_QTY } from "@/lib/constants";
import { isValidCustomerEmail, normalizeCustomerEmail } from "@/lib/customer-email";
import { isKenyaCounty } from "@/lib/kenya-counties";
import { findOrCreateCustomer } from "@/lib/operations";
import { notifyCustomerByEmail } from "@/lib/order-notifications";
import { isUsablePhone, normalizeKenyanPhone } from "@/lib/phone";
import { prisma } from "@/lib/prisma";
import { publishedProduct } from "@/lib/shop-query";
import { orderWhatsappMessage, whatsappLink } from "@/lib/whatsapp";

const sources = new Set(Object.values(CustomerSource));

function asSource(value: unknown): CustomerSource {
  if (typeof value === "string" && sources.has(value as CustomerSource)) {
    return value as CustomerSource;
  }
  return CustomerSource.WEBSITE;
}

type FulfillmentType = "PICKUP" | "DELIVERY";

function asFulfillment(value: unknown): FulfillmentType {
  return value === "PICKUP" ? "PICKUP" : "DELIVERY";
}

function deliveryZone(county: string): DeliveryZone {
  return county.trim().toLowerCase() === "nairobi" ? DeliveryZone.NAIROBI : DeliveryZone.UPCOUNTRY;
}

function buildPickupAddress() {
  return `Shop pickup · ${BUSINESS.location} · ${BUSINESS.landmark}`;
}

function buildDeliveryAddress(input: {
  county: string;
  city: string;
  address: string;
  roomNumber: string;
}) {
  const parts = [
    input.roomNumber ? `Unit ${input.roomNumber}` : "",
    input.address,
    input.city,
    input.county,
  ].filter(Boolean);
  return parts.join(" · ");
}

export async function POST(request: Request) {
  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const phone = normalizeKenyanPhone(String(body.phone ?? "").trim());
  const county = String(body.county ?? "").trim();
  const city = String(body.city ?? "").trim();
  const address = String(body.address ?? "").trim();
  const roomNumber = String(body.roomNumber ?? "").trim();
  const notes = String(body.notes ?? "").trim();
  const rawEmail = String(body.email ?? "").trim();
  const email = rawEmail ? normalizeCustomerEmail(rawEmail) : undefined;
  const fulfillment = asFulfillment(body.fulfillmentType);
  const source = asSource(body.source);
  const items = Array.isArray(body.items) ? body.items : [];

  if (!name || !phone || items.length === 0) {
    return NextResponse.json(
      { error: "Please enter your name, phone number and at least one product." },
      { status: 400 },
    );
  }
  if (!isUsablePhone(phone)) {
    return NextResponse.json(
      { error: "Please enter a valid Kenyan phone number, e.g. 07XX XXX XXX." },
      { status: 400 },
    );
  }
  if (email && !isValidCustomerEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  if (fulfillment === "DELIVERY") {
    if (!county || !isKenyaCounty(county)) {
      return NextResponse.json({ error: "Please select your county." }, { status: 400 });
    }
    if (!city) {
      return NextResponse.json({ error: "Please enter your town or city." }, { status: 400 });
    }
    if (!address) {
      return NextResponse.json({ error: "Please enter your delivery address." }, { status: 400 });
    }
  }

  const zone =
    fulfillment === "PICKUP" ? DeliveryZone.NAIROBI : deliveryZone(county);
  const location =
    fulfillment === "PICKUP"
      ? buildPickupAddress()
      : buildDeliveryAddress({ county, city, address, roomNumber });

  const productIds = items.map((item: { productId?: string }) => String(item.productId ?? ""));
  const products = await prisma.product.findMany({
    where: {
      AND: [{ id: { in: productIds } }, publishedProduct],
    },
  });
  const productMap = new Map(products.map((product) => [product.id, product]));

  try {
    const orderItems = items.map((item: { productId?: string; quantity?: number }) => {
      const product = productMap.get(String(item.productId));
      const quantity = Math.min(MAX_ORDER_LINE_QTY, Math.max(1, Number(item.quantity) || 1));
      if (!product) throw new Error("PRODUCT_NOT_FOUND");
      // Out of stock without "Ask us" should not be orderable from the website.
      if (!product.askForAvailability && product.stockQuantity <= 0) {
        throw new Error("PRODUCT_OUT_OF_STOCK");
      }
      return {
        product,
        quantity,
        unitPriceKes: product.priceKes,
        lineTotalKes: product.priceKes * quantity,
      };
    });

    const subtotalKes = orderItems.reduce(
      (sum: number, item: { lineTotalKes: number }) => sum + item.lineTotalKes,
      0,
    );
    const orderNumber = `VEL-${Date.now().toString(36).toUpperCase()}`;
    const fulfillmentNote =
      fulfillment === "PICKUP"
        ? "Customer will collect from the shop."
        : "Customer requested delivery.";
    const combinedNotes = ["Customer submitted this order request on the website.", fulfillmentNote, notes]
      .filter(Boolean)
      .join("\n");

    const order = await prisma.$transaction(async (tx) => {
      const customer = await findOrCreateCustomer(
        {
          name,
          phone,
          email,
          location,
          source,
        },
        tx,
      );

      return tx.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          source,
          status: "ENQUIRY",
          fromWebsiteRequest: true,
          subtotalKes,
          deliveryFeeKes: 0,
          totalKes: subtotalKes,
          notes: combinedNotes,
          items: {
            create: orderItems.map((item: (typeof orderItems)[number]) => ({
              productId: item.product.id,
              name: item.product.name,
              quantity: item.quantity,
              unitPriceKes: item.unitPriceKes,
              lineTotalKes: item.lineTotalKes,
            })),
          },
          payment: {
            create: {
              method: PaymentMethod.OTHER,
              status: "UNPAID",
              amountKes: subtotalKes,
            },
          },
          delivery: {
            create: {
              zone,
              address: location,
              feeKes: 0,
              status: "PENDING",
            },
          },
          events: {
            create: { message: "Order request received from the website." },
          },
        },
        include: { items: true },
      });
    });

    void notifyCustomerByEmail(order.id, "received");

    const deliveryLabel =
      fulfillment === "PICKUP"
        ? "Shop pickup"
        : zone === DeliveryZone.NAIROBI
          ? "Nairobi delivery"
          : "Delivery outside Nairobi";

    const whatsappUrl = whatsappLink(
      orderWhatsappMessage(
        order.items.map((item) => `${item.name} × ${item.quantity}`),
        location,
        deliveryLabel,
        name,
        order.orderNumber,
      ),
    );

    return NextResponse.json({ orderNumber: order.orderNumber, whatsappUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "PRODUCT_NOT_FOUND") {
      return NextResponse.json(
        { error: "One of the products is no longer available. Please refresh and try again." },
        { status: 400 },
      );
    }
    if (message === "PRODUCT_OUT_OF_STOCK") {
      return NextResponse.json(
        {
          error:
            "One of the products is out of stock. Remove it from your order or check back later.",
        },
        { status: 400 },
      );
    }
    console.error(error);
    return NextResponse.json({ error: "Could not send the order. Please try again." }, { status: 500 });
  }
}
