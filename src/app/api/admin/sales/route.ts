import { CustomerSource, DeliveryZone, PaymentMethod, PaymentStatus } from "@prisma/client";
import { shopPickupAddress } from "@/lib/admin-order-display";
import { DomainError, recordSale } from "@/lib/operations";
import { isUsablePhone } from "@/lib/phone";
import { requireAdmin } from "@/lib/require-admin";
import { revalidateStoreCatalog } from "@/lib/revalidate-store";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  if (!isUsablePhone(String(body.phone ?? ""))) {
    return NextResponse.json(
      { error: "Please enter a phone number we can reach the customer on." },
      { status: 400 },
    );
  }

  const fulfillment = body.fulfillment === "DELIVERY" ? "DELIVERY" : "PICKUP";
  const paymentMode = String(body.paymentMode ?? "cash");
  const paymentMethod: PaymentMethod =
    paymentMode === "mpesa"
      ? PaymentMethod.MPESA
      : paymentMode === "later"
        ? PaymentMethod.PAY_ON_DELIVERY
        : PaymentMethod.CASH;
  const paymentStatus =
    paymentMode === "later" ? PaymentStatus.UNPAID : PaymentStatus.PAID;

  const address =
    fulfillment === "PICKUP"
      ? shopPickupAddress()
      : String(body.address ?? "").trim();

  if (fulfillment === "DELIVERY" && !address) {
    return NextResponse.json({ error: "Please enter the delivery address." }, { status: 400 });
  }

  const completeNow = fulfillment === "PICKUP" && paymentStatus === PaymentStatus.PAID;

  try {
    const order = await recordSale({
      name: String(body.name ?? ""),
      phone: String(body.phone ?? ""),
      address,
      zone:
        fulfillment === "PICKUP"
          ? DeliveryZone.NAIROBI
          : body.zone === "UPCOUNTRY"
            ? DeliveryZone.UPCOUNTRY
            : DeliveryZone.NAIROBI,
      source: (body.source as CustomerSource) || CustomerSource.WALK_IN,
      paymentMethod,
      paymentStatus,
      mpesaCode: String(body.mpesaCode ?? "") || undefined,
      notes: String(body.notes ?? "") || undefined,
      deliveryFeeKes: fulfillment === "DELIVERY" ? Number(body.deliveryFeeKes) || 0 : 0,
      completeNow,
      items: Array.isArray(body.items) ? body.items : [],
    });
    revalidateStoreCatalog();
    return NextResponse.json({
      orderNumber: order.orderNumber,
      id: order.id,
      closed: completeNow,
    });
  } catch (error) {
    const message = error instanceof DomainError ? error.message : "Could not record the sale.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
