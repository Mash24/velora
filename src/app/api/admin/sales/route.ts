import { CustomerSource, DeliveryZone, PaymentMethod, PaymentStatus } from "@prisma/client";
import { DomainError, recordSale } from "@/lib/operations";
import { isUsablePhone } from "@/lib/phone";
import { requireAdmin } from "@/lib/require-admin";
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
  try {
    const order = await recordSale({
      name: String(body.name ?? ""),
      phone: String(body.phone ?? ""),
      address: String(body.address ?? ""),
      zone: body.zone === "UPCOUNTRY" ? DeliveryZone.UPCOUNTRY : DeliveryZone.NAIROBI,
      source: (body.source as CustomerSource) || CustomerSource.WALK_IN,
      paymentMethod: (body.paymentMethod as PaymentMethod) || PaymentMethod.CASH,
      paymentStatus: body.paymentStatus === "PAID" ? PaymentStatus.PAID : PaymentStatus.UNPAID,
      mpesaCode: String(body.mpesaCode ?? "") || undefined,
      notes: String(body.notes ?? "") || undefined,
      items: Array.isArray(body.items) ? body.items : [],
    });
    return NextResponse.json({ orderNumber: order.orderNumber, id: order.id });
  } catch (error) {
    const message = error instanceof DomainError ? error.message : "Could not record the sale.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
